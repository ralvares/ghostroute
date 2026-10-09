import { parseAllDocuments } from "yaml";
import { S } from "../simulation/state.js";
import { readVirtualFile } from "../simulation/filesystem.js";
import type { Resource } from "../simulation/cluster-model.js";
import { getImage, imageSbom, scanSbom } from "../security/rhacs/images.js";
import { cveSeverities, scanImage, rawScan } from "../security/rhacs/scan.js";
import {
  checkPolicies,
  checkDeployment,
  combinePolicies,
  failingPolicies,
} from "../security/rhacs/policies.js";
import type { ToolResult } from "./text-tools.js";
import { runQuery } from "./query-tools.js";
export interface TableRequest {
  headers: string[];
  rows: string[][];
  merge: boolean;
  noHeader: boolean;
}
export type TableRenderer = (request: TableRequest) => Promise<string>;
const render: TableRenderer = async (request) => {
  const result = await runQuery("rox-table", JSON.stringify(request), "");
  if (result.exitCode) throw new Error(result.stderr);
  return result.stdout;
};
const help = `roxctl 4.11.3 — offline Central (authored game assets)\nroxctl image scan --image REF --output table|json|csv [--severity CRITICAL,IMPORTANT] [--fail]\nroxctl image check --image REF [--output table|json|csv] [--categories CATEGORY]\nroxctl deployment check --file MANIFEST [--file MANIFEST] [--output table|json|csv]\nroxctl image sbom --image REF > sbom.spdx.json\nroxctl sbom scan --file sbom.spdx.json --output table|json|csv [--fail]\nCatalog: cat rhacs/images/catalog.json\nDefault and stage policies: cat rhacs/policies/active.json\nGuide: cat rhacs/README.md\nUnknown images, components, commands and formats report explicit simulation limits.\n`;
const booleans = [
  "force",
  "include-snoozed",
  "fail",
  "compact-output",
  "merge-output",
  "no-header",
  "headers-as-comments",
  "direct-grpc",
  "insecure",
  "insecure-skip-tls-verify",
  "plaintext",
  "no-color",
  "force-http1",
  "use-current-k8s-context",
  "verbose",
  "help",
];
const common = [
  "endpoint",
  "password",
  "server-name",
  "token-file",
  "ca",
  "timeout",
  ...booleans.filter(
    (f) =>
      ![
        "force",
        "include-snoozed",
        "fail",
        "compact-output",
        "merge-output",
        "no-header",
        "headers-as-comments",
        "verbose",
      ].includes(f),
  ),
];
const printers = [
  "output",
  "compact-output",
  "headers",
  "required-headers",
  "merge-output",
  "no-header",
  "headers-as-comments",
];
function flags(words: string[], deployment: boolean) {
  const found: Record<string, string[]> = {};
  const positional: string[] = [];
  const alias: Record<string, string> = {
    i: "image",
    o: "output",
    e: "endpoint",
    p: "password",
    s: "server-name",
    t: "timeout",
    n: "namespace",
    c: "categories",
    a: "include-snoozed",
    v: "verbose",
    h: "help",
    r: "retries",
    d: "retry-delay",
    f: deployment ? "file" : "force",
  };
  for (let i = 0; i < words.length; i++) {
    const token = words[i];
    if (!token.startsWith("-")) {
      positional.push(token);
      continue;
    }
    const eq = token.indexOf("=");
    const key = (eq < 0 ? token : token.slice(0, eq)).replace(/^--?/, "");
    const name = alias[key] ?? key;
    const value =
      eq < 0
        ? booleans.includes(name)
          ? "true"
          : words[++i]
        : token.slice(eq + 1);
    if (value === undefined || value.startsWith("--"))
      throw new Error(`flag needs an argument: ${token}`);
    if (booleans.includes(name) && !["true", "false"].includes(value))
      throw new Error(
        `invalid argument ${JSON.stringify(value)} for --${name}`,
      );
    (found[name] ??= []).push(value);
  }
  return {
    found,
    positional,
    get: (name: string) => found[name]?.at(-1),
    bool: (name: string, def = false) =>
      found[name] ? found[name].at(-1) === "true" : def,
  };
}
const json = (value: unknown, compact: boolean) =>
  JSON.stringify(value, null, compact ? undefined : 2) + (compact ? "" : "\n");
function csv(
  headers: string[],
  rows: string[][],
  noHeader: boolean,
  comments: boolean,
) {
  const quote = (s: string) =>
    /[",\n\r]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s;
  return [...(noHeader ? [] : [headers]), ...rows]
    .map(
      (r, i) =>
        (comments && !noHeader && i === 0 ? "; " : "") +
        r.map(quote).join(",") +
        "\n",
    )
    .join("");
}
export async function roxctlCommand(
  words: string[],
  table = render,
): Promise<ToolResult> {
  try {
    const deployment = words.includes("deployment");
    const f = flags(words.slice(1), deployment);
    const [group, action, ...rest] = f.positional;
    if (
      f.bool("help") ||
      !group ||
      (["image", "deployment", "sbom"].includes(group) && !action)
    )
      return { stdout: help, exitCode: 0 };
    if (group === "version" && !action)
      return { stdout: "4.11.3\n", exitCode: 0 };
    if (rest.length) throw new Error("accepts no positional arguments");
    if (
      ![
        "image scan",
        "image check",
        "image sbom",
        "deployment check",
        "sbom scan",
      ].includes(`${group} ${action}`)
    )
      throw new Error(
        `simulation: roxctl ${group} ${action ?? ""} is not implemented`,
      );
    const scanning = action === "scan",
      sbom = group === "sbom",
      generating = action === "sbom";
    const allowed = [
      ...common,
      ...(generating ? [] : printers),
      ...(sbom
        ? ["file", "content-type", "severity", "fail"]
        : deployment
          ? ["file", "namespace", "categories", "force", "verbose"]
          : [
              "image",
              "force",
              "cluster",
              "namespace",
              "retries",
              "retry-delay",
              ...(scanning
                ? ["include-snoozed", "severity", "fail"]
                : generating
                  ? []
                  : ["categories"]),
            ]),
    ];
    for (const key of Object.keys(f.found))
      if (!allowed.includes(key))
        throw new Error(
          `simulation: roxctl option --${key} is not implemented for ${group} ${action}`,
        );
    if (f.get("token-file")) readVirtualFile(f.get("token-file")!);
    if (f.get("ca")) readVirtualFile(f.get("ca")!);
    if (
      sbom &&
      f.get("content-type") &&
      !["application/spdx+json", "text/spdx+json"].includes(
        f.get("content-type")!,
      )
    )
      throw new Error("invalid or unsupported SBOM content type");
    const subject = sbom
      ? f.get("file")
      : deployment
        ? f.found.file?.join(",")
        : f.get("image");
    if (!subject)
      throw new Error(
        `required flag(s) "${sbom || deployment ? "file" : "image"}" not set`,
      );
    const categories = f.found.categories?.flatMap((v) => v.split(",")) ?? [];
    const format =
      f.get("output") ??
      (scanning ? (sbom ? "raw-json" : "legacy-json") : "table");
    if (
      !generating &&
      (format !== "raw-json" || !!f.get("output")) &&
      ![
        "json",
        "table",
        "csv",
        ...(scanning && !sbom ? ["legacy-json"] : []),
      ].includes(format)
    )
      throw new Error(
        `simulation: roxctl output format ${format} is not implemented`,
      );
    let payload: any;
    let headers: string[];
    let rows: string[][];
    let summary: Record<string, number>;
    let exitCode = 0;
    let stderr = "";
    let prefix = "";
    let digest: string | undefined;
    if (generating) {
      const image = getImage(subject);
      return { stdout: json(imageSbom(image), false), exitCode: 0 };
    }
    if (scanning) {
      const severities =
        f.found.severity?.flatMap((v) =>
          v.split(",").map((s) => s.toUpperCase()),
        ) ?? cveSeverities;
      if (severities.some((s) => !cveSeverities.includes(s)))
        throw new Error(
          `invalid severity used. Choose one of [${cveSeverities.join(", ")}]`,
        );
      const image = sbom
        ? scanSbom(JSON.parse(readVirtualFile(subject)))
        : getImage(subject);
      digest = sbom ? undefined : image.digest;
      payload = scanImage(image, severities, f.bool("include-snoozed"));
      summary = payload.result.summary;
      headers = [
        "COMPONENT",
        "VERSION",
        "CVE",
        "SEVERITY",
        "CVSS",
        "LINK",
        "FIXED_VERSION",
        "ADVISORY",
        "ADVISORY_LINK",
      ];
      rows = (payload.result.vulnerabilities ?? []).map((v: any) => [
        v.componentName,
        v.componentVersion,
        v.cveId,
        v.cveSeverity,
        String(v.cveCVSS),
        v.cveInfo,
        v.componentFixedVersion,
        v.advisoryId,
        v.advisoryInfo,
      ]);
      prefix = `Scan results for ${sbom ? "SBOM" : "image"}: ${subject}\n(TOTAL-COMPONENTS: ${summary["TOTAL-COMPONENTS"]}, TOTAL-VULNERABILITIES: ${summary["TOTAL-VULNERABILITIES"]}, LOW: ${summary.LOW}, MODERATE: ${summary.MODERATE}, IMPORTANT: ${summary.IMPORTANT}, CRITICAL: ${summary.CRITICAL})\n\n`;
      if (format === "legacy-json" || format === "raw-json")
        payload = sbom
          ? { scan: rawScan(image).scan }
          : rawScan(image, f.bool("include-snoozed"));
      else if (f.bool("fail") && summary["TOTAL-VULNERABILITIES"] > 0) {
        exitCode = 1;
        stderr = `ERROR:\t${sbom ? "" : "image scan failed: "}vulnerabilities found: ${summary["TOTAL-VULNERABILITIES"]} vulnerabilities\n`;
      }
    } else {
      if (deployment) {
        const workloads: Resource[] = [];
        for (const path of f.found.file!.flatMap((v) => v.split(",")))
          for (const doc of parseAllDocuments(readVirtualFile(path))) {
            if (doc.errors.length)
              throw new Error(`invalid YAML: ${doc.errors[0].message}`);
            const value = doc.toJS();
            if (!value) continue;
            for (const obj of value.kind === "List" ? value.items : [value]) {
              if (!obj?.metadata?.name || !obj.kind)
                throw new Error(
                  "invalid deployment YAML: kind and metadata.name required",
                );
              obj.metadata.namespace ??= f.get("namespace") ?? "default";
              workloads.push(obj);
            }
          }
        if (!workloads.length)
          throw new Error("no deployments found in provided files");
        payload = combinePolicies(
          workloads.map((w) => checkDeployment(w, categories)),
        );
      } else {
        const image = getImage(subject);
        digest = image.digest;
        payload = checkPolicies([image], "BUILD", undefined, categories);
      }
      summary = payload.summary;
      headers = [
        "POLICY",
        "SEVERITY",
        deployment ? "BREAKS DEPLOY" : "BREAKS BUILD",
        ...(deployment ? ["DEPLOYMENT"] : []),
        "DESCRIPTION",
        "VIOLATION",
        "REMEDIATION",
      ];
      rows = (payload.results ?? []).flatMap((r: any) =>
        r.violatedPolicies.map((p: any) => [
          p.name,
          p.severity,
          p.failingCheck ? "X" : "-",
          ...(deployment ? [r.metadata.additionalInfo?.name ?? "-"] : []),
          p.description,
          p.violation.map((v: string) => "- " + v).join("\n"),
          p.remediation,
        ]),
      );
      prefix = `Policy check results for ${deployment ? "deployments: [" + (payload.results ?? []).map((r: any) => r.metadata.additionalInfo?.name).join(" ") + "]" : "image: " + subject}\n(TOTAL: ${summary.TOTAL}, LOW: ${summary.LOW}, MEDIUM: ${summary.MEDIUM}, HIGH: ${summary.HIGH}, CRITICAL: ${summary.CRITICAL})\n\n`;
      const failing = failingPolicies(payload);
      if (format === "table" && summary.TOTAL) {
        stderr = `WARN:\tA total of ${summary.TOTAL} policies have been violated\n`;
        if (failing) {
          stderr += `ERROR:\tfailed policies found: ${failing} policies violated that are failing the check\n`;
          for (const r of payload.results ?? [])
            for (const p of r.violatedPolicies.filter(
              (p: any) => p.failingCheck,
            ))
              stderr += `ERROR:\tPolicy ${JSON.stringify(p.name)}${deployment ? " within Deployment " + JSON.stringify(r.metadata.additionalInfo?.name) : ""} - Possible remediation: ${JSON.stringify(p.remediation)}\n`;
        }
      }
      if (failing) {
        exitCode = 1;
        stderr += `ERROR:\t${deployment ? "breaking policies found" : "checking image failed"}: failed policies found: ${failing} policies violated that are failing the check\n`;
      }
    }
    let stdout: string;
    if (format === "raw-json") stdout = JSON.stringify(payload);
    else if (format === "json" || format === "legacy-json")
      stdout = json(payload, f.bool("compact-output"));
    else {
      const chosen = f.get("headers")?.split(",") ?? headers;
      const indexes = chosen.map((h) => headers.indexOf(h));
      if (indexes.some((i) => i < 0))
        throw new Error("simulation: unknown table header");
      const required = f.get("required-headers")?.split(",") ?? [];
      if (required.some((h) => !headers.includes(h)))
        throw new Error("simulation: unknown required table header");
      rows = rows
        .filter((row) => required.every((h) => !!row[headers.indexOf(h)]))
        .map((row) => indexes.map((i) => row[i] || "-"));
      stdout =
        (format === "table" ? prefix : "") +
        (format === "csv"
          ? csv(
              chosen,
              rows,
              f.bool("no-header"),
              f.bool("headers-as-comments"),
            )
          : await table({
              headers: chosen.map((h) => h.replaceAll("_", " ")),
              rows,
              merge: f.bool("merge-output", true),
              noHeader: f.bool("no-header"),
            }));
    }
    if (!f.get("output") && !sbom && scanning)
      stderr =
        "INFO:\tDefault image scan output currently uses deprecated legacy-json for backwards compatibility. Use --output=json to migrate to the new JSON output format. NOTE: it contains breaking changes in the format.\n";
    if (format === "table" && scanning && summary["TOTAL-VULNERABILITIES"] > 0)
      stderr =
        `WARN:\tA total of ${summary["TOTAL-VULNERABILITIES"]} unique vulnerabilities were found in ${summary["TOTAL-COMPONENTS"]} components\n` +
        stderr;
    S.cluster.rhacs.receipts.push({
      operation: `${group} ${action}`,
      subject,
      ...(digest ? { digest } : {}),
      exitCode,
      summary,
    });
    S.cluster.rhacs.receipts = S.cluster.rhacs.receipts.slice(-50);
    return { stdout, stderr, error: exitCode !== 0, exitCode };
  } catch (e) {
    return {
      stdout: "",
      stderr: `ERROR:\t${(e as Error).message}\n`,
      error: true,
      exitCode: 1,
    };
  }
}
