import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import {
  resourceTable,
  simulationEpoch,
} from "../.test-build/src/simulation/resource-table.js";
import { printResourceTable } from "../.test-build/src/terminal/table-printer.js";
import { createCluster } from "../.test-build/src/simulation/cluster-model.js";
const binary = process.argv[2];
if (!binary) throw Error("Pass a compiled tools/conformance oracle binary");
const oracle = (req) => {
  const r = spawnSync(binary, [], {
    input: JSON.stringify(req),
    encoding: "utf8",
  });
  if (r.status !== 0) throw Error(r.stderr);
  return r.stdout;
};
const object = {
  apiVersion: "v1",
  kind: "Pod",
  metadata: {
    name: "payment-api",
    namespace: "payments",
    creationTimestamp: "2026-10-08T00:14:00Z",
    labels: { app: "payment-api", tier: "backend" },
  },
  spec: {
    nodeName: "worker-01",
    containers: [{ name: "app", image: "busybox" }],
  },
  status: {
    phase: "Running",
    podIPs: [{ ip: "10.128.0.21" }],
    containerStatuses: [
      { name: "app", ready: true, restartCount: 0, state: { running: {} } },
    ],
    conditions: [{ type: "Ready", status: "True" }],
  },
};
const cases = [];
const add = (name, change, kind = "Pod") => {
  const r = structuredClone(kind === "Pod" ? object : change);
  if (kind === "Pod") change(r);
  const cells = JSON.parse(
    oracle({ Object: r, Now: new Date(simulationEpoch).toISOString() }),
  );
  cases.push({ name, object: r, cells });
};
add("ready", () => {});
add("not ready", (r) => (r.status.containerStatuses[0].ready = false));
add("no status yet", (r) => (r.status = { phase: "Pending" }));
add("no phase reported", (r) => (r.status = {}));
add(
  "image pull",
  (r) =>
    (r.status.containerStatuses[0] = {
      name: "app",
      ready: false,
      restartCount: 0,
      state: { waiting: { reason: "ImagePullBackOff" } },
    }),
);
add(
  "crash loop recent restart",
  (r) =>
    (r.status.containerStatuses[0] = {
      name: "app",
      ready: false,
      restartCount: 3,
      state: { waiting: { reason: "CrashLoopBackOff" } },
      lastState: { terminated: { finishedAt: "2026-10-08T02:13:20Z" } },
    }),
);
add(
  "terminating",
  (r) => (r.metadata.deletionTimestamp = "2026-10-08T02:13:50Z"),
);
add("deleted unreachable", (r) => {
  r.metadata.deletionTimestamp = "2026-10-08T02:13:50Z";
  r.status.reason = "NodeLost";
});
add("deleted completed remains completed", (r) => {
  r.metadata.deletionTimestamp = "2026-10-08T02:13:50Z";
  r.status.phase = "Succeeded";
  r.status.containerStatuses[0] = {
    name: "app",
    ready: false,
    state: { terminated: { exitCode: 0, reason: "Completed" } },
  };
});
add("scheduling gated", (r) => {
  r.status = {
    phase: "Pending",
    conditions: [{ type: "PodScheduled", reason: "SchedulingGated" }],
  };
  delete r.spec.nodeName;
});
for (const exit of [
  { exitCode: 0, reason: "Completed" },
  { exitCode: 2 },
  { exitCode: 137, reason: "OOMKilled" },
  { exitCode: 1, signal: 9 },
])
  add(
    "terminated " + JSON.stringify(exit),
    (r) =>
      (r.status.containerStatuses[0] = {
        name: "app",
        ready: false,
        restartCount: 1,
        state: { terminated: exit },
      }),
  );
add("mixed completion ready", (r) => {
  r.spec.containers.push({ name: "helper" });
  r.status.containerStatuses.push({
    name: "helper",
    state: { terminated: { exitCode: 0, reason: "Completed" } },
  });
});
add("mixed completion unready", (r) => {
  r.spec.containers.push({ name: "helper" });
  r.status.conditions = [];
  r.status.containerStatuses.unshift({
    name: "helper",
    state: { terminated: { exitCode: 0, reason: "Completed" } },
  });
});
add("mixed completion error", (r) => {
  r.spec.containers.push({ name: "helper" });
  r.status.containerStatuses.push({
    name: "helper",
    state: { terminated: { exitCode: 2, reason: "Error" } },
  });
});
for (const state of [
  { waiting: { reason: "PodInitializing" } },
  { waiting: { reason: "CrashLoopBackOff" } },
  { terminated: { exitCode: 1 } },
  { terminated: { exitCode: 1, signal: 9 } },
  { terminated: { exitCode: 2, reason: "Error" } },
  { terminated: { exitCode: 0 } },
])
  add("init " + JSON.stringify(state), (r) => {
    r.spec.initContainers = [{ name: "init" }];
    r.status.initContainerStatuses = [{ name: "init", state, restartCount: 2 }];
  });
add("initialized condition overrides stale init state", (r) => {
  r.spec.initContainers = [{ name: "init" }];
  r.status.initContainerStatuses = [
    {
      name: "init",
      state: { waiting: { reason: "CrashLoopBackOff" } },
      restartCount: 2,
    },
  ];
  r.status.conditions.push({ type: "Initialized", status: "True" });
});
add("restartable sidecar", (r) => {
  r.spec.initContainers = [{ name: "sidecar", restartPolicy: "Always" }];
  r.status.initContainerStatuses = [
    {
      name: "sidecar",
      started: true,
      ready: true,
      state: { running: {} },
      restartCount: 2,
      lastState: { terminated: { finishedAt: "2026-10-08T02:10:00Z" } },
    },
  ];
});
add("restartable sidecar still starting", (r) => {
  r.spec.initContainers = [{ name: "sidecar", restartPolicy: "Always" }];
  r.status.initContainerStatuses = [
    {
      name: "sidecar",
      started: false,
      ready: false,
      state: { waiting: { reason: "PodInitializing" } },
      restartCount: 0,
    },
  ];
});
add("readiness gates", (r) => {
  r.spec.readinessGates = [
    { conditionType: "Approved" },
    { conditionType: "Checked" },
  ];
  r.status.conditions.push({ type: "Approved", status: "True" });
  r.status.nominatedNodeName = "worker-02";
});
add("missing timestamp", (r) => delete r.metadata.creationTimestamp);
for (const scc of createCluster().sccs)
  add(scc.metadata.name, scc, "SecurityContextConstraints");
add(
  "zero priority custom SCC",
  {
    ...structuredClone(createCluster().sccs[0]),
    metadata: { name: "custom-zero" },
    priority: 0,
    allowedCapabilities: [],
    volumes: ["*"],
  },
  "SecurityContextConstraints",
);
const route = {
  apiVersion: "route.openshift.io/v1",
  kind: "Route",
  metadata: { name: "checkout" },
  spec: {
    host: "checkout.example.test",
    to: { kind: "Service", name: "app" },
    wildcardPolicy: "None",
  },
};
for (const ingress of [
  undefined,
  [],
  [
    {
      host: "checkout.example.test",
      conditions: [
        { type: "Admitted", status: "False", reason: "HostAlreadyClaimed" },
      ],
    },
  ],
  [
    {
      host: "checkout.example.test",
      conditions: [{ type: "Admitted", status: "True" }],
    },
  ],
])
  add(
    "route ingress " + JSON.stringify(ingress),
    { ...structuredClone(route), status: { ingress } },
    "Route",
  );
add(
  "route weighted TLS",
  {
    ...structuredClone(route),
    spec: {
      ...route.spec,
      to: { name: "app", weight: 80 },
      alternateBackends: [{ name: "canary", weight: 20 }],
      port: { targetPort: "http" },
      tls: { termination: "edge", insecureEdgeTerminationPolicy: "Redirect" },
    },
  },
  "Route",
);
const tableCases = [];
for (const kind of ["Pod", "SecurityContextConstraints", "Route"]) {
  const resources = cases
    .filter((c) => c.object.kind === kind)
    .map((c) => c.object);
  for (const options of [
    {},
    { wide: true },
    { namespace: true },
    { wide: true, namespace: true, showLabels: true, labelColumns: ["app"] },
    { noHeaders: true },
    { namespace: true, noHeaders: true },
  ]) {
    const table = resourceTable(resources, kind, simulationEpoch);
    const output = oracle({
      Table: table,
      Options: {
        Wide: !!options.wide,
        WithNamespace: !!options.namespace,
        NoHeaders: !!options.noHeaders,
        ShowLabels: !!options.showLabels,
        ColumnLabels: options.labelColumns ?? [],
      },
    });
    const actual = printResourceTable(table, options);
    if (actual !== output) {
      writeFileSync("/private/tmp/ghostroute-printers/actual.txt", actual);
      writeFileSync("/private/tmp/ghostroute-printers/expected.txt", output);
      throw Error("Table differs: " + kind + " " + JSON.stringify(options));
    }
    tableCases.push({ kind, options, output });
  }
}
const jsonCases = [
  {
    apiVersion: "v1",
    kind: "List",
    items: cases.slice(0, 3).map((c) => c.object),
    metadata: { resourceVersion: "" },
  },
  {
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: { name: "evidence" },
    data: { message: "<>&\u2028\u2029", literal: 'quotes " and \\ and tab\t' },
    numbers: [0, 1000, 3.14],
    nested: { z: true, a: null },
  },
].map((object) => ({
  object,
  output: oracle({ Object: object, Mode: "json" }),
}));
writeFileSync(
  "tests/fixtures/upstream-printers.json",
  JSON.stringify(
    {
      sources: [
        "https://raw.githubusercontent.com/kubernetes/kubernetes/v1.35.2/pkg/printers/internalversion/printers.go",
        "https://raw.githubusercontent.com/openshift/openshift-apiserver/77f4eab69952824801ecc4113666a5e87684c899/pkg/security/printers/internalversion/printer.go",
        "https://raw.githubusercontent.com/openshift/openshift-apiserver/77f4eab69952824801ecc4113666a5e87684c899/pkg/route/printers/internalversion/printer.go",
      ],
      oracle: "tools/conformance/main.go",
      now: simulationEpoch,
      cases,
      tableCases,
      jsonCases,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Recorded " +
    cases.length +
    " independent server printer cases and " +
    tableCases.length +
    " byte-for-byte client table cases",
);
