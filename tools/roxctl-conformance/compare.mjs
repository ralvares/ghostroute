// Native roxctl runs only against local, authored Central responses. No real credentials.
import http2 from "node:http2";
import http from "node:http";
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import {
  getImage,
  imageSbom,
} from "../../.test-build/src/security/rhacs/images.js";
import { rawScan } from "../../.test-build/src/security/rhacs/scan.js";
import {
  checkPolicies,
  checkDeployment,
} from "../../.test-build/src/security/rhacs/policies.js";
import { roxctlCommand } from "../../.test-build/src/terminal/roxctl.js";
import { readVirtualFile } from "../../.test-build/src/simulation/filesystem.js";
import { resetState, S } from "../../.test-build/src/simulation/state.js";
import { parse } from "yaml";
const out = "artifacts/roxctl";
mkdirSync(out, { recursive: true });
const enc = new TextEncoder();
const cat = (...v) => Buffer.concat(v.flat());
const varint = (n) => {
  let v = [];
  do {
    v.push((n & 127) | (n > 127 ? 128 : 0));
    n = Math.floor(n / 128);
  } while (n);
  return Buffer.from(v);
};
const number = (i, n) => cat(varint(i * 8), varint(n));
const bytes = (i, b) => cat(varint(i * 8 + 2), varint(b.length), b);
const str = (i, s) => bytes(i, Buffer.from(s ?? ""));
const float = (i, n) => {
  let b = Buffer.alloc(4);
  b.writeFloatLE(n);
  return cat(varint(i * 8 + 5), b);
};
const severity = { LOW: 1, MODERATE: 2, IMPORTANT: 3, CRITICAL: 4 };
function imageProto(a) {
  return cat(
    bytes(
      1,
      cat(
        str(1, a.ref.split("/")[0]),
        str(2, a.ref.split("/").slice(1).join("/").split(":")[0]),
        str(3, a.ref.split(":").at(-1)),
        str(4, a.ref),
      ),
    ),
    str(4, a.digest),
    bytes(
      3,
      cat(
        ...a.components.map((c) =>
          bytes(
            2,
            cat(
              str(1, c.name),
              str(2, c.version),
              ...c.vulns.map((v) =>
                bytes(
                  4,
                  cat(
                    str(1, v.cve),
                    float(2, v.cvss),
                    str(4, v.link),
                    str(5, v.fixedBy),
                    number(19, severity[v.severity]),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
function alertProto(p, i, metadata) {
  return cat(
    bytes(
      2,
      cat(
        str(1, "policy-" + i),
        str(2, p.name),
        str(3, p.description),
        str(5, p.remediation),
        number(
          12,
          ["LOW", "MEDIUM", "HIGH", "CRITICAL"].indexOf(p.severity) + 1,
        ),
        ...(p.failingCheck ? [number(13, metadata ? 1 : 4)] : []),
      ),
    ),
    ...p.violation.map((v) => bytes(5, str(1, v))),
    ...(metadata
      ? [
          bytes(
            4,
            cat(
              str(1, metadata.id),
              str(2, metadata.additionalInfo.name),
              str(5, metadata.additionalInfo.namespace),
              str(4, metadata.additionalInfo.type),
            ),
          ),
        ]
      : []),
  );
}
let asset = getImage("registry.example.test/payments:v1.8.2"),
  report = checkPolicies([asset], "BUILD");
const grpc = http2.createServer();
grpc.on("stream", (stream, headers) => {
  stream.on("error", () => {});
  stream.on("data", () => {});
  stream.on("end", () => {
    const route = headers[":path"];
    let response;
    if (route === "/v1.ImageService/ScanImage") response = imageProto(asset);
    else if (route === "/v1.DetectionService/DetectBuildTime")
      response = cat(
        ...(report.results ?? []).flatMap((r) =>
          r.violatedPolicies.map((p, i) => bytes(1, alertProto(p, i))),
        ),
      );
    else if (route === "/v1.DetectionService/DetectDeployTimeFromYAML")
      response = cat(
        ...(report.results ?? []).map((r) =>
          bytes(
            1,
            cat(
              str(1, r.metadata.additionalInfo.name),
              str(2, r.metadata.additionalInfo.type),
              ...r.violatedPolicies.map((p, i) =>
                bytes(3, alertProto(p, i, r.metadata)),
              ),
            ),
          ),
        ),
      );
    else {
      stream.respond({
        ":status": 200,
        "content-type": "application/grpc",
        "grpc-status": "12",
      });
      stream.end();
      return;
    }
    let frame = Buffer.alloc(5);
    frame.writeUInt32BE(response.length, 1);
    stream.respond(
      { ":status": 200, "content-type": "application/grpc" },
      { waitForTrailers: true },
    );
    stream.on("wantTrailers", () =>
      stream.sendTrailers({ "grpc-status": "0" }),
    );
    stream.end(cat(frame, response));
  });
});
await new Promise((r) => grpc.listen(0, "127.0.0.1", r));
const sbomServer = http.createServer((req, res) => {
  req.resume();
  req.on("end", () => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      req.url === "/api/v1/images/sbom"
        ? JSON.stringify(imageSbom(asset), null, 2) + "\n"
        : JSON.stringify({ scan: rawScan(asset).scan }),
    );
  });
});
await new Promise((r) => sbomServer.listen(0, "127.0.0.1", r));
const render = async (req) =>
  execFileSync("/private/tmp/ghostroute-rox-table", [], {
    input: JSON.stringify(req),
    encoding: "utf8",
  });
const cli = process.env.GHOSTROUTE_ROXCTL ?? "/usr/local/bin/roxctl";
const env = { ...process.env };
for (let k of Object.keys(env)) if (k.startsWith("ROX_")) delete env[k];
const native = (args) =>
  new Promise((resolve) => {
    let stdout = "",
      stderr = "";
    let p = spawn(cli, args, { env });
    p.stdout.on("data", (d) => (stdout += d));
    p.stderr.on("data", (d) => (stderr += d));
    p.on("close", (code) => resolve({ stdout, stderr, exitCode: code }));
  });
const receipts = [];
try {
  for (let version of ["v1.8.2", "v1.8.3"]) {
    asset = getImage("registry.example.test/payments:" + version);
    report = checkPolicies([asset], "BUILD");
    const variants = [
      ["image","scan","--image",asset.ref],
      ["image", "scan", "--image", asset.ref, "--output", "json"],
      [
        "image",
        "scan",
        "--image",
        asset.ref,
        "--output",
        "json",
        "--compact-output",
      ],
      ["image", "scan", "--image", asset.ref, "--output", "table"],
      ["image", "scan", "--image", asset.ref, "--output", "csv"],
      [
        "image",
        "scan",
        "--image",
        asset.ref,
        "--output",
        "json",
        "--severity",
        "LOW",
        "--fail",
      ],
      ["image", "scan", "--image", asset.ref, "--output", "json", "--fail"],
      ["image", "check", "--image", asset.ref, "--output", "json"],
      ["image", "check", "--image", asset.ref, "--output", "table"],
      ["image", "check", "--image", asset.ref, "--output", "csv"],
    ];
    for (const args of variants) await compare(args, false);
    writeFileSync(
      "/private/tmp/ghostroute-sbom.spdx.json",
      JSON.stringify(imageSbom(asset)),
    );
    await compare(["image", "sbom", "--image", asset.ref], true);
    await compare(["sbom","scan","--file","/private/tmp/ghostroute-sbom.spdx.json"],true);
    for (const fmt of ["json", "table", "csv"]) {
      let args = [
        "sbom",
        "scan",
        "--file",
        "/private/tmp/ghostroute-sbom.spdx.json",
        "--output",
        fmt,
        "--fail",
      ];
      await compare(args, true);
    }
  }
  asset = getImage("registry.example.test/payments:v1.8.2");
  S.campaign.active = 18;
  for (const fmt of ["json", "table", "csv"]) {
    const yaml = readVirtualFile("rhacs/payments-v1.yaml");
    writeFileSync("/private/tmp/ghostroute-rox-deployment.yaml", yaml);
    report = checkDeployment(parse(yaml));
    await compare(
      [
        "deployment",
        "check",
        "--file",
        "/private/tmp/ghostroute-rox-deployment.yaml",
        "--output",
        fmt,
      ],
      false,
    );
  }
  async function compare(args, sbom) {
    const port = (sbom ? sbomServer : grpc).address().port;
    const real = await native([
      "--endpoint",
      `127.0.0.1:${port}`,
      "--insecure",
      "--plaintext",
      "--direct-grpc",
      "--no-color",
      "--password",
      "training",
      ...args,
    ]);
    const simulatedArgs = args.map((x) =>
      x === "/private/tmp/ghostroute-sbom.spdx.json"
        ? "rhacs/sboms/payments-" +
          (asset.ref.endsWith("v1.8.2") ? "v1" : "v2") +
          ".spdx.json"
        : x === "/private/tmp/ghostroute-rox-deployment.yaml"
          ? "rhacs/payments-v1.yaml"
          : x,
    );
    const sim = await roxctlCommand(["roxctl", ...simulatedArgs], render);
    // SBOM path is context-specific in the summary. Normalize only this explicit path.
    const expected = real.stdout.replaceAll(
      "/private/tmp/ghostroute-sbom.spdx.json",
      simulatedArgs[3],
    );
    const id = String(receipts.length + 1).padStart(2, "0");
    writeFileSync(`${out}/${id}-native.stdout`, real.stdout);
    writeFileSync(`${out}/${id}-simulated.stdout`, sim.stdout);
    writeFileSync(`${out}/${id}-native.stderr`, real.stderr);
    const passed = expected === sim.stdout && real.exitCode === sim.exitCode;
    receipts.push({
      command: ["roxctl", ...simulatedArgs].join(" "),
      fixture: asset.ref,
      stdoutEqual: expected === sim.stdout,
      exitCodeEqual: real.exitCode === sim.exitCode,
      nativeExitCode: real.exitCode,
      passed,
    });
    if (!passed) console.log("DIFF", id, receipts.at(-1));
  }
} finally {
  grpc.close();
  sbomServer.close();
}
writeFileSync(
  `${out}/native-comparison.json`,
  JSON.stringify(
    {
      version: execFileSync(cli, ["version"], { encoding: "utf8" }).trim(),
      source: "9947d9c2267c78595af7af197c4af8900008b269",
      boundary:
        "CLI output/exit status against authored localhost Central responses; not a live Central policy-engine comparison.",
      comparisons: receipts,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `${receipts.filter((r) => r.passed).length}/${receipts.length} native comparisons passed`,
);
if (receipts.some((r) => !r.passed)) process.exitCode = 1;
