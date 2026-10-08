import { printResourceJson } from "../.test-build/src/terminal/json-printer.js";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  resourceTable,
  humanDuration,
  jsonPathValues,
} from "../.test-build/src/simulation/resource-table.js";
import { printResourceTable } from "../.test-build/src/terminal/table-printer.js";
import {
  kubeRequest,
  apiBody,
} from "../.test-build/src/simulation/kube-api.js";
import { clusterCommand } from "../.test-build/src/terminal/cluster-shell.js";
import {
  resetState,
  replaceState,
  S,
} from "../.test-build/src/simulation/state.js";
import {
  refreshResourceTypes,
  resolveResource,
} from "../.test-build/src/simulation/resource-types.js";
import {
  encodeProgress,
  decodeProgress,
} from "../.test-build/src/simulation/snapshot.js";
const fixtures = JSON.parse(
  readFileSync(new URL("./fixtures/upstream-printers.json", import.meta.url)),
);
for (const fixture of fixtures.cases)
  test("upstream server printer: " + fixture.name, () => {
    assert.deepEqual(
      resourceTable([fixture.object], fixture.object.kind, fixtures.now).rows[0]
        .cells,
      fixture.cells,
    );
  });
for (const fixture of fixtures.tableCases)
  test(
    "upstream client bytes: " +
      fixture.kind +
      " " +
      JSON.stringify(fixture.options),
    () => {
      const objects = fixtures.cases
        .filter((c) => c.object.kind === fixture.kind)
        .map((c) => c.object);
      assert.equal(
        printResourceTable(
          resourceTable(objects, fixture.kind, fixtures.now),
          fixture.options,
        ),
        fixture.output,
      );
    },
  );
for (const [i, fixture] of fixtures.jsonCases.entries())
  test("upstream JSONPrinter bytes: " + i, () => {
    assert.equal(printResourceJson(fixture.object), fixture.output);
  });
test("API negotiates Table; default/-A/wide formats agree with the same Pod JSON", async () => {
  resetState();
  const response = kubeRequest({
    method: "GET",
    path: "/api/v1/pods",
    accept: "application/json;as=Table;g=meta.k8s.io;v=v1",
  });
  assert.equal(response.code, 200);
  assert.equal(response.body.kind, "Table");
  assert.deepEqual(
    response.body.columnDefinitions.map((c) => c.name),
    [
      "Name",
      "Ready",
      "Status",
      "Restarts",
      "Age",
      "IP",
      "Node",
      "Nominated Node",
      "Readiness Gates",
    ],
  );
  assert.equal(
    response.body.rows[0].object.status.containerStatuses[0].ready,
    true,
  );
  let result = await clusterCommand("oc get pods -A");
  assert.match(
    result.stdout,
    /^NAMESPACE\s+NAME\s+READY\s+STATUS\s+RESTARTS\s+AGE\n/,
  );
  assert.match(
    result.stdout,
    /payments\s+payment-api-7d9cd-ab12\s+1\/1\s+Running\s+0\s+120m/,
  );
  assert.doesNotMatch(result.stdout, /SCC/);
  assert.equal(
    (await clusterCommand("oc get pods")).stdout,
    "No resources found in default namespace.\n",
  );
  assert.match(
    (await clusterCommand("oc get pods -npayments -owide --no-headers")).stdout,
    /payment-api-7d9cd-ab12\s+1\/1\s+Running\s+0\s+120m\s+10.128.0.21\s+worker-01/,
  );
  S.pods[0].ready = false;
  assert.match(
    (
      await clusterCommand(
        "oc get pods -A --field-selector=metadata.name=payment-api-7d9cd-ab12",
      )
    ).stdout,
    /0\/1\s+Running/,
  );
  const json = JSON.parse(
    (await clusterCommand("oc get pods -n payments -o json")).stdout,
  );
  assert.equal(
    json.items.find((p) => p.metadata.name === "payment-api-7d9cd-ab12").status
      .containerStatuses[0].ready,
    false,
  );
  assert.ok(json.items[0].metadata.creationTimestamp);
});
test("SCC output follows the ten OpenShift columns; SCC annotation is an explicit custom column", async () => {
  resetState();
  const result = await clusterCommand("oc get scc -A");
  assert.match(
    result.stdout,
    /^NAME\s+PRIVILEGED\s+CAPABILITIES\s+SELINUX\s+RUNASUSER\s+FSGROUP\s+SUPPLEMENTALGROUPS\s+PRIORITY\s+READONLYFS\s+VOLUMES\n/,
  );
  assert.match(
    result.stdout,
    /anyuid\s+false\s+MustRunAs\s+RunAsAny\s+RunAsAny\s+RunAsAny\s+10\s+false/,
  );
  assert.doesNotMatch(result.stdout, /NAMESPACE/);
  const custom = await clusterCommand(
    "oc get pods -A -o 'custom-columns=Name:.metadata.name,scc:.metadata.annotations.openshift\\.io/scc'",
  );
  assert.match(custom.stdout, /^Name\s+scc\n/);
  assert.match(custom.stdout, /payment-api-7d9cd-ab12\s+restricted-v3/);
  assert.equal(
    resolveResource("scc.security.openshift.io"),
    "securitycontextconstraints",
  );
});
test("server selectors implement sets, absence and field filtering; invalid selectors fail explicitly", async () => {
  resetState();
  assert.equal(
    kubeRequest({
      method: "GET",
      path: "/api/v1/pods?labelSelector=app%20in%20(payment-api)",
    }).body.items.length,
    2,
  );
  assert.equal(
    kubeRequest({
      method: "GET",
      path: "/api/v1/pods?labelSelector=app%20notin%20(payment-api)",
    }).body.items.length,
    1,
  );
  assert.equal(
    kubeRequest({ method: "GET", path: "/api/v1/pods?labelSelector=!app" }).body
      .items.length,
    0,
  );
  assert.equal(
    kubeRequest({ method: "GET", path: "/api/v1/pods?labelSelector=!incident" })
      .body.items.length,
    3,
  );
  assert.equal(
    kubeRequest({
      method: "GET",
      path: "/api/v1/pods?fieldSelector=spec.nodeName%3Dworker-01",
    }).body.items.length,
    1,
  );
  assert.equal(
    kubeRequest({
      method: "GET",
      path: "/api/v1/pods?fieldSelector=nonexistent%3Dx",
    }).code,
    400,
  );
  assert.equal(
    kubeRequest({ method: "GET", path: "/api/v1/pods?labelSelector=broken(" })
      .code,
    400,
  );
});
const crd = {
  apiVersion: "apiextensions.k8s.io/v1",
  kind: "CustomResourceDefinition",
  metadata: { name: "signals.security.example.test" },
  spec: {
    group: "security.example.test",
    scope: "Namespaced",
    names: {
      kind: "Signal",
      plural: "signals",
      singular: "signal",
      shortNames: ["sig"],
    },
    versions: [
      {
        name: "v1",
        served: true,
        storage: true,
        schema: {
          openAPIV3Schema: {
            type: "object",
            properties: {
              spec: {
                type: "object",
                required: ["severity"],
                properties: {
                  severity: { type: "integer", minimum: 0, maximum: 10 },
                  approved: { type: "boolean", default: false },
                  owner: { type: "string" },
                },
              },
            },
          },
        },
        additionalPrinterColumns: [
          { name: "Severity", type: "integer", jsonPath: ".spec.severity" },
          { name: "Approved", type: "boolean", jsonPath: ".spec.approved" },
          {
            name: "Owner",
            type: "string",
            priority: 1,
            jsonPath: ".spec.owner",
          },
        ],
      },
    ],
  },
};
test("custom CRDs are persisted, discovered, admitted and printed from their actual definition", async () => {
  resetState();
  S.cluster.user = "platform-admin";
  const request = {
    method: "POST",
    path: "/apis/apiextensions.k8s.io/v1/customresourcedefinitions",
    body: crd,
  };
  assert.equal(kubeRequest(request).code, 201);
  let result = kubeRequest({
    method: "POST",
    path: "/apis/security.example.test/v1/namespaces/payments/signals",
    body: {
      apiVersion: "security.example.test/v1",
      kind: "Signal",
      metadata: { name: "suspicious" },
      spec: { severity: 9, owner: "mira", ignored: "pruned" },
    },
  });
  assert.equal(result.code, 201);
  assert.equal(result.body.spec.approved, false);
  assert.equal(result.body.spec.ignored, undefined);
  const creation = result.body.metadata.creationTimestamp;
  assert.match(
    (await clusterCommand("oc get sig -A -o wide")).stdout,
    /^NAMESPACE\s+NAME\s+SEVERITY\s+APPROVED\s+OWNER\n/,
  );
  assert.match(
    (await clusterCommand("oc get signals.security.example.test -A")).stdout,
    /payments\s+suspicious\s+9\s+false/,
  );
  const saved = encodeProgress(S);
  resetState();
  assert.equal(resolveResource("sig"), undefined);
  replaceState(decodeProgress(saved));
  refreshResourceTypes();
  assert.equal(resolveResource("sig"), "signals");
  result = kubeRequest({
    ...request,
    method: "PATCH",
    path: request.path + "/signals.security.example.test",
    contentType: "application/apply-patch+yaml",
  });
  assert.equal(result.code, 200);
  assert.equal(
    (await clusterCommand("oc get crd signals.security.example.test -o name"))
      .stdout,
    "customresourcedefinition.apiextensions.k8s.io/signals.security.example.test\n",
  );
  assert.equal(
    kubeRequest({
      method: "GET",
      path: "/apis/security.example.test/v1/namespaces/payments/signals/suspicious",
    }).body.metadata.creationTimestamp,
    creation,
  );
  const invalid = kubeRequest({
    method: "POST",
    path: "/apis/security.example.test/v1/namespaces/payments/signals",
    body: {
      apiVersion: "security.example.test/v1",
      kind: "Signal",
      metadata: { name: "bad" },
      spec: { severity: 99 },
    },
  });
  assert.equal(invalid.code, 422);
  assert.equal(
    kubeRequest({
      method: "DELETE",
      path: request.path + "/signals.security.example.test",
    }).code,
    200,
  );
  assert.equal(resolveResource("sig"), undefined);
  assert.ok(!S.cluster.resources.some((r) => r.kind === "Signal"));
});
test("installed CRD columns come from the schema and wide columns respect priority", async () => {
  resetState();
  assert.ok(
    S.cluster.resources.some(
      (r) =>
        r.kind === "CustomResourceDefinition" &&
        r.metadata.name === "compliancescans.compliance.openshift.io",
    ),
  );
  S.cluster.resources.push({
    apiVersion: "compliance.openshift.io/v1alpha1",
    kind: "ComplianceScan",
    metadata: { name: "baseline", namespace: "payments" },
    status: { phase: "DONE", result: "NON-COMPLIANT" },
  });
  assert.match(
    (await clusterCommand("oc get compliancescans -n payments")).stdout,
    /^NAME\s+PHASE\s+RESULT\n/,
  );
  assert.match(
    (await clusterCommand("oc get compliancescans -n payments")).stdout,
    /baseline\s+DONE\s+NON-COMPLIANT/,
  );
  const table = resourceTable(
    [
      {
        apiVersion: "v1",
        kind: "Example",
        metadata: { name: "filtered" },
        status: {
          conditions: [
            { type: "Ready", status: "False" },
            { type: "Checked", status: "True" },
          ],
        },
      },
    ],
    "Example",
    fixtures.now,
    [
      {
        name: "Ready",
        type: "string",
        jsonPath: '.status.conditions[?(@.type=="Ready")].status',
      },
    ],
  );
  assert.equal(table.rows[0].cells[1], "False");
});
test("creation timestamps survive apply, numeric sorting is numeric, labels do not forge ready status", async () => {
  resetState();
  S.cluster.user = "platform-admin";
  await clusterCommand("oc create namespace test");
  await clusterCommand("oc create deployment ten --image=busybox -n test");
  await clusterCommand("oc scale deployment ten --replicas=10 -n test");
  await clusterCommand("oc create deployment two --image=busybox -n test");
  await clusterCommand("oc scale deployment two --replicas=2 -n test");
  const output = await clusterCommand(
    "oc get deployments -n test --sort-by=.spec.replicas --no-headers",
  );
  assert.match(output.stdout, /^two\s+2\/2\s+2\s+2/);
  const pod = JSON.parse(
    (await clusterCommand("oc get pod two-sim-0 -n test -o json")).stdout,
  );
  assert.equal(pod.status.containerStatuses[0].restartCount, 0);
  assert.ok(pod.metadata.creationTimestamp);
});
test("duration thresholds match Kubernetes HumanDuration and missing dates remain unknown", () => {
  const seconds = [
    -2, -1, 0, 119, 120, 121, 599, 600, 10799, 10800, 10861, 28799, 28800,
    172800, 176400, 691200, 63072000,
  ];
  const values = [
    "<invalid>",
    "0s",
    "0s",
    "119s",
    "2m",
    "2m1s",
    "9m59s",
    "10m",
    "179m",
    "3h",
    "3h1m",
    "7h59m",
    "8h",
    "2d",
    "2d1h",
    "8d",
    "2y",
  ];
  assert.deepEqual(
    seconds.map((s) => humanDuration(s * 1000)),
    values,
  );
  assert.deepEqual(
    jsonPathValues(
      { metadata: { annotations: { "openshift.io/scc": "restricted-v3" } } },
      ".metadata.annotations.openshift\\.io/scc",
    ),
    ["restricted-v3"],
  );
});
test("4.22 default SCC inventory uses upstream fields and v3 UID boundaries", async () => {
  resetState();
  assert.equal(S.cluster.sccs.length, 13);
  const v3 = S.cluster.sccs.find((s) => s.metadata.name === "restricted-v3");
  assert.equal(v3.runAsUser.uidRangeMin, 1000);
  assert.equal(v3.runAsUser.uidRangeMax, 65534);
  assert.ok(v3.volumes.includes("image"));
  await clusterCommand("oc create namespace bounds");
  for (const uid of [1000, 1001, 65534]) {
    const resource = {
      apiVersion: "v1",
      kind: "Pod",
      metadata: { name: "uid-" + uid },
      spec: {
        containers: [
          {
            name: "app",
            image: "busybox",
            securityContext: { runAsUser: uid },
          },
        ],
      },
    };
    const response = kubeRequest({
      method: "POST",
      path: "/api/v1/namespaces/bounds/pods",
      body: resource,
    });
    assert.equal(response.code, 201);
    assert.equal(
      response.body.metadata.annotations["openshift.io/scc"],
      "restricted-v3",
    );
  }
  const response = kubeRequest({
    method: "POST",
    path: "/api/v1/namespaces/bounds/pods",
    body: {
      apiVersion: "v1",
      kind: "Pod",
      metadata: { name: "vendor" },
      spec: {
        containers: [
          {
            name: "app",
            image: "busybox",
            securityContext: { runAsUser: 100 },
          },
        ],
      },
    },
  });
  assert.equal(response.code, 403);
  assert.match(response.body.message, /must be in the ranges: \[1000, 65534\]/);
});
test("API pagination follows stable collection tokens and rejects changed/invalid cursors", () => {
  resetState();
  const first = kubeRequest({ method: "GET", path: "/api/v1/pods?limit=1" });
  assert.equal(first.body.items.length, 1);
  assert.ok(first.body.metadata.continue);
  const second = kubeRequest({
    method: "GET",
    path:
      "/api/v1/pods?limit=1&continue=" +
      encodeURIComponent(first.body.metadata.continue),
  });
  assert.equal(second.body.items.length, 1);
  assert.notEqual(
    second.body.items[0].metadata.name,
    first.body.items[0].metadata.name,
  );
  S.pods[0].ready = false;
  assert.equal(
    kubeRequest({
      method: "GET",
      path:
        "/api/v1/pods?limit=1&continue=" +
        encodeURIComponent(first.body.metadata.continue),
    }).code,
    410,
  );
  assert.equal(
    kubeRequest({ method: "GET", path: "/api/v1/pods?limit=-1" }).code,
    400,
  );
  assert.equal(
    kubeRequest({ method: "GET", path: "/api/v1/pods?continue=bad-token" })
      .code,
    400,
  );
});
test("older saves receive current defaults without losing authored vendor exceptions or player notes", () => {
  resetState();
  S.story.notes = "Evidence I kept";
  S.cluster.sccs.push({
    apiVersion: "security.openshift.io/v1",
    kind: "SecurityContextConstraints",
    metadata: { name: "rs-vendor" },
    runAsUser: { type: "MustRunAs", uid: 1001 },
    allowPrivilegedContainer: false,
  });
  S.cluster.resources.push({
    apiVersion: "v1",
    kind: "Pod",
    metadata: { name: "vendor", namespace: "rs-05" },
    spec: {
      containers: [
        {
          name: "vendor",
          image: "registry.example.test/vendor:fixed-uid",
          securityContext: { runAsUser: 1001 },
        },
      ],
    },
  });
  const before = JSON.parse(encodeProgress(S));
  delete before.data.cluster.policyRevision;
  before.data.cluster.resources = before.data.cluster.resources.filter(
    (r) => r.kind !== "CustomResourceDefinition",
  );
  before.data.cluster.sccs = before.data.cluster.sccs.filter((s) =>
    [
      "restricted-v3",
      "restricted-v2",
      "nonroot-v2",
      "anyuid",
      "rs-vendor",
    ].includes(s.metadata.name),
  );
  const after = decodeProgress(JSON.stringify(before));
  assert.ok(
    after.cluster.resources.some(
      (r) => r.metadata.name === "compliancescans.compliance.openshift.io",
    ),
  );
  assert.equal(after.story.notes, "Evidence I kept");
  assert.equal(after.cluster.sccs.length, 14);
  assert.equal(
    after.cluster.sccs.find((s) => s.metadata.name === "rs-vendor").runAsUser
      .uid,
    100,
  );
  assert.equal(
    after.cluster.resources.find((r) => r.metadata.name === "vendor").spec
      .containers[0].securityContext.runAsUser,
    100,
  );
});
test("projects use Project API objects and display-name/status columns", async () => {
  resetState();
  S.cluster.resources.find(
    (r) => r.kind === "Namespace" && r.metadata.name === "payments",
  ).metadata.annotations["openshift.io/display-name"] = "Payments";
  assert.match(
    (await clusterCommand("oc get projects")).stdout,
    /^NAME\s+DISPLAY NAME\s+STATUS\n/,
  );
  assert.match(
    (await clusterCommand("oc get projects")).stdout,
    /payments\s+Payments\s+Active/,
  );
  const json = JSON.parse(
    (await clusterCommand("oc get project payments -o json")).stdout,
  );
  assert.equal(json.kind, "Project");
  assert.equal(json.apiVersion, "project.openshift.io/v1");
});
test("created events are read from the same server collection and disappear on delete", () => {
  resetState();
  S.cluster.user = "platform-admin";
  const object = {
    apiVersion: "v1",
    kind: "Event",
    metadata: { name: "app.failed", namespace: "payments" },
    type: "Warning",
    reason: "Failed",
    message: "Retained event",
    involvedObject: { kind: "Pod", name: "app" },
  };
  assert.equal(
    kubeRequest({
      method: "POST",
      path: "/api/v1/namespaces/payments/events",
      body: object,
    }).code,
    201,
  );
  assert.equal(
    kubeRequest({
      method: "GET",
      path: "/api/v1/namespaces/payments/events/app.failed",
    }).body.message,
    "Retained event",
  );
  assert.equal(
    kubeRequest({
      method: "DELETE",
      path: "/api/v1/namespaces/payments/events/app.failed",
    }).code,
    200,
  );
  assert.equal(
    kubeRequest({
      method: "GET",
      path: "/api/v1/namespaces/payments/events/app.failed",
    }).code,
    404,
  );
});

test("installed CRD deletion survives current saves and reset restores its discovery", () => {
  resetState();
  S.cluster.user = "platform-admin";
  S.cluster.resources.push({
    apiVersion: "compliance.openshift.io/v1alpha1",
    kind: "ComplianceScan",
    metadata: { name: "temporary", namespace: "payments" },
  });
  const path =
    "/apis/apiextensions.k8s.io/v1/customresourcedefinitions/compliancescans.compliance.openshift.io";
  assert.equal(kubeRequest({ method: "DELETE", path }).code, 200);
  assert.equal(resolveResource("compliancescans"), undefined);
  assert.ok(!S.cluster.resources.some((r) => r.kind === "ComplianceScan"));
  replaceState(decodeProgress(encodeProgress(S)));
  assert.ok(
    !S.cluster.resources.some(
      (r) => r.metadata.name === "compliancescans.compliance.openshift.io",
    ),
  );
  assert.equal(resolveResource("compliancescans"), undefined);
  resetState();
  assert.equal(resolveResource("compliancescans"), "compliancescans");
});
