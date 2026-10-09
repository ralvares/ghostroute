import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { kubeRequest } from "../.test-build/src/simulation/kube-api.js";
import { clusterCommand } from "../.test-build/src/terminal/cluster-shell.js";
import { resetState } from "../.test-build/src/simulation/state.js";
resetState();
const server = createServer((req, res) => {
  const response = kubeRequest({
    method: req.method,
    path: req.url,
    accept: req.headers.accept,
  });
  res.writeHead(response.code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(response.body));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const cache = mkdtempSync(join(tmpdir(), "ghostroute-oc-cache-"));
mkdirSync("artifacts/campaign", { recursive: true });
const native = (args) =>
  new Promise((resolve, reject) => {
    const p = spawn(process.env.GHOSTROUTE_OC ?? "oc", args);
    let stdout = "",
      stderr = "";
    p.stdout.on("data", (v) => (stdout += v));
    p.stderr.on("data", (v) => (stderr += v));
    p.on("error", reject);
    p.on("exit", (code) => (code ? reject(Error(stderr)) : resolve(stdout)));
  });
const commands = [
  ["get", "pods", "-A"],
  ["get", "pods", "-A", "-o", "json"],
  ["get", "scc", "restricted-v3", "-o", "json"],
  ["get", "--raw", "/api/v1/pods"],
  ["get", "pods", "-A", "-o", "wide"],
  ["get", "pods", "-n", "payments", "--no-headers"],
  ["get", "pods", "-A", "--show-labels", "-L", "app"],
  ["get", "pods", "-A", "-l", "app in (payment-api)"],
  ["get", "pods", "-A", "--field-selector=spec.nodeName=worker-01"],
  ["get", "deployments", "-A"],
  ["get", "deployments", "-n", "payments", "-L", "labels"],
  ["get", "deployments", "-n", "payments", "-L", "app"],
  ["get", "deployments", "-n", "payments", "--show-labels"],
  ["get", "services", "-n", "payments", "-o", "wide"],
  ["get", "routes", "-n", "payments"],
  ["get", "endpoints", "-n", "payments"],
  ["get", "endpointslices", "-n", "payments"],
  ["expose", "deployment/payment-api", "-n", "payments", "--port=8080", "--name=preview", "--dry-run=client", "-o", "json"],
  ["expose", "service/payment-api", "-n", "payments", "--name=preview", "--hostname=preview.example.test", "--dry-run=client", "-o", "json"],
  ["get", "nodes", "-o", "wide"],
  ["get", "scc"],
  ["get", "scc", "anyuid"],
  ["get", "crd"],
  ["get", "projects"],
  [
    "get",
    "pods",
    "-A",
    "-o",
    "custom-columns=Name:.metadata.name,scc:.metadata.annotations.openshift\\.io/scc",
  ],
];
const results = [];
try {
  const version = await native(["version", "--client"]);
  for (const args of commands) {
    const real = await native([
      "--server=http://127.0.0.1:" + server.address().port,
      "--kubeconfig=/dev/null",
      "--cache-dir=" + cache,
      "--request-timeout=10s",
      ...args,
    ]);
    const quoted = args
      .map((a) => (/\s|\\/.test(a) ? "'" + a + "'" : a))
      .join(" ");
    const simulated = await clusterCommand("oc " + quoted);
    try {
      assert.equal(simulated.stdout, real);
    } catch (e) {
      writeFileSync(join(cache, "native-expected.txt"), real);
      writeFileSync(join(cache, "native-actual.txt"), simulated.stdout);
      throw Error("Native output mismatch: oc " + quoted + "\n" + e.message + "\nComparison files: " + cache);
    }
    results.push("oc " + quoted);
    console.log("MATCH: oc " + quoted);
  }
  writeFileSync(
    "artifacts/campaign/native-oc-tables.json",
    JSON.stringify(
      {
        client: version.trim(),
        server: "offline mock API; not a live OpenShift acceptance test",
        commands: results,
        byte_exact: true,
        pinned422PrinterFixtures: "tests/fixtures/upstream-printers.json",
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  server.close();
}
