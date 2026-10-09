import { stringify } from "yaml";
import type { ClueId } from "../security/evidence.js";
import type { SimulationState } from "../simulation/state.js";
import { buildIncidentResources } from "../simulation/incident-resources.js";
import { tokenize } from "../terminal/lexer.js";

export interface IncidentRecord {
  path: string;
  source: string;
  capturedAt: string;
  content: string;
  proof: string[];
}
const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
const originalDeployment = buildIncidentResources({
  audit: [],
  podRev: 1,
  policies: new Set(),
  deployment: {
    env: { TELEMETRY_ENDPOINT: "https://203.0.113.77/upload" },
    readyReplicas: 2,
  },
  pods: [],
}).find((r) => r.kind === "Deployment")!;

/** Immutable case observations from the opening incident, not the current API store. */
export const incidentRecords: Record<ClueId, IncidentRecord> = {
  rhacs: {
    path: "case/incident-018/rhacs-observation.json",
    source: "Rhea · retained RHACS network observation",
    capturedAt: "2026-10-08T02:14:02Z",
    content: json({
      case: "018",
      capturedAt: "2026-10-08T02:14:02Z",
      cluster: "prod-east",
      deployment: "payments/payment-api",
      baseline: [
        "openshift-dns:53/UDP",
        "openshift-dns:53/TCP",
        "ledger:8443/TCP",
      ],
      observed: { destination: "203.0.113.77", port: 443, protocol: "TCP" },
      outsideBaseline: true,
      assessment:
        "A deviation is a lead; the observation does not establish compromise.",
    }),
    proof: ["payment-api", "203.0.113.77", "outsideBaseline"],
  },
  trace: {
    path: "case/incident-018/network-flows.json",
    source: "Rhea · retained Pod network trace",
    capturedAt: "2026-10-08T02:14:02Z",
    content: json({
      case: "018",
      capturedAt: "2026-10-08T02:14:02Z",
      cluster: "prod-east",
      flows: [
        {
          pod: "payment-api-7d9cd-ab12",
          namespace: "payments",
          node: "worker-01",
          sourceIP: "10.128.0.21",
          destinationIP: "203.0.113.77",
          destinationPort: 443,
        },
        {
          pod: "payment-api-7d9cd-cd34",
          namespace: "payments",
          node: "worker-02",
          sourceIP: "10.129.0.22",
          destinationIP: "203.0.113.77",
          destinationPort: 443,
        },
      ],
    }),
    proof: ["payment-api-7d9cd-ab12", "payment-api-7d9cd-cd34", "203.0.113.77"],
  },
  logs: {
    path: "case/incident-018/payment-api.log",
    source: "Rhea · application log preserved before remediation",
    capturedAt: "2026-10-08T02:14:18Z",
    content:
      "2026-10-08T02:13:44Z INFO payment-api: ready, listening on :8080\n2026-10-08T02:14:02Z WARN telemetry: POST https://203.0.113.77/upload (unexpected configured target)\n2026-10-08T02:14:11Z INFO ledger request completed: 200 OK\n2026-10-08T02:14:18Z INFO /healthz passed\n",
    proof: ["telemetry: POST", "https://203.0.113.77/upload"],
  },
  env: {
    path: "case/incident-018/deployment-before.yaml",
    source: "Rhea · Deployment snapshot before remediation",
    capturedAt: "2026-10-08T02:14:18Z",
    content: stringify(originalDeployment),
    proof: ["payment-api", "TELEMETRY_ENDPOINT", "https://203.0.113.77/upload"],
  },
  policy: {
    path: "case/incident-018/networkpolicies-before.json",
    source: "Rhea · payments policy inventory before containment",
    capturedAt: "2026-10-08T02:14:18Z",
    content: json({
      apiVersion: "networking.k8s.io/v1",
      kind: "NetworkPolicyList",
      metadata: {},
      items: [],
    }),
    proof: ["NetworkPolicyList", '"items": []'],
  },
};
export const incidentRecordFiles = Object.fromEntries(
  Object.values(incidentRecords).map((record) => [record.path, record.content]),
);
incidentRecordFiles["case/incident-018/README.md"] =
  "CASE 018 — RETAINED INCIDENT RECORDS\nRhea preserved these observations before remediation. They describe the opening incident, not the current cluster. Fixing a Deployment or adding policies does not erase them.\n\n" +
  Object.entries(incidentRecords)
    .map(
      ([id, r]) =>
        `${id}: ${r.source}\nCaptured: ${r.capturedAt}\nRead: cat ~/${r.path}\n`,
    )
    .join("\n") +
  "\nCompare the retained evidence with oc get/oc logs for the current state. A deviation does not establish compromise. Correlate the audit request, release run and permission review before explaining the cause.\n";

export function incidentRecordStatus(state: SimulationState, id: ClueId) {
  if (id === "policy")
    return state.incidentNetwork.external
      ? "Current external path remains open"
      : "Current external path blocked";
  if (id === "env" || id === "logs")
    return state.env
      ? "Unexpected exporter setting remains"
      : "Unexpected exporter setting removed";
  return state.env && state.incidentNetwork.external
    ? "External flow remains active"
    : "Original external flow stopped or blocked";
}

/** Only a successful read of the retained file, with its evidence in the output, earns review credit. */
export function reviewedIncidentRecords(
  raw: string,
  output: string,
  cwd: string,
): ClueId[] {
  const tokens = tokenize(raw);
  if (
    !["cat", "jq", "more", "less", "head", "tail", "grep"].includes(
      tokens[0]?.value,
    )
  )
    return [];
  const paths = tokens
    .filter((t) => t.kind === "word")
    .slice(1)
    .map((t) => {
      let path = t.value.replace(
        /^~(?=\/|$)|^\$HOME(?=\/|$)/,
        "/home/operator",
      );
      if (!path.startsWith("/")) path = cwd + "/" + path;
      const parts: string[] = [];
      for (const part of path.split("/")) {
        if (part === "..") parts.pop();
        else if (part && part !== ".") parts.push(part);
      }
      return "/" + parts.join("/");
    });
  return (Object.entries(incidentRecords) as [ClueId, IncidentRecord][])
    .filter(
      ([, r]) =>
        paths.includes("/home/operator/" + r.path) &&
        r.proof.every((p) => output.includes(p)),
    )
    .map(([id]) => id);
}
