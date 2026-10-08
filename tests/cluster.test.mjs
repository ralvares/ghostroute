import test from "node:test";
import assert from "node:assert/strict";
import { resetState, S } from "../.test-build/src/simulation/state.js";
import {
  applyResource,
  getResources,
  grantScc,
  restartDeployment,
} from "../.test-build/src/simulation/cluster-api.js";
import { labFiles } from "../.test-build/src/simulation/lab-files.js";
import { parse } from "yaml";
import { tokenize } from "../.test-build/src/terminal/lexer.js";
import { roleAllows } from "../.test-build/src/security/rbac.js";

function lab() {
  resetState();
  applyResource(
    { apiVersion: "v1", kind: "Namespace", metadata: { name: "lab" } },
    "default",
  );
}

test("namespace creation persists; operator cannot grant SCC or create custom SCC", () => {
  lab();
  assert.equal(
    getResources("namespaces", undefined, "lab")[0].status.phase,
    "Active",
  );
  assert.throws(
    () => grantScc("anyuid", "default", "lab"),
    /cannot create resource "rolebindings"/,
  );
  assert.throws(
    () => applyResource(parse(labFiles["scc/vendor-fixed-uid.yaml"]), "lab"),
    /Forbidden/,
  );
  assert.ok(
    S.cluster.audit.some(
      (event) =>
        event.responseStatus.code === 403 &&
        event.annotations["authorization.k8s.io/decision"] === "forbid",
    ),
  );
});

test("owned root Pod fails SCC, secure app runs with default restricted-v3 and allocated UID", () => {
  lab();
  assert.throws(
    () => applyResource(parse(labFiles["workloads/owned-root.yaml"]), "lab"),
    /unable to validate against any security context constraint/,
  );
  assert.equal(getResources("pods", "lab").length, 0);
  const failure = S.cluster.audit.at(-2); // final list is itself audited
  assert.equal(failure.responseStatus.code, 403);
  assert.equal(failure.annotations["authorization.k8s.io/decision"], "allow");
  applyResource(parse(labFiles["workloads/owned-secure.yaml"]), "lab");
  const pod = getResources("pods", "lab", "owned-secure")[0];
  assert.equal(pod.metadata.annotations["openshift.io/scc"], "restricted-v3");
  assert.equal(pod.spec.hostUsers, false);
  assert.equal(pod.spec.containers[0].securityContext.runAsUser, 1000780000);
  assert.equal(pod.status.containerStatuses[0].ready, true);
});

test("Deployment API succeeds while controller Pods fail SCC; a scoped custom exception repairs the immutable vendor", () => {
  lab();
  applyResource(
    { apiVersion: "v1", kind: "ServiceAccount", metadata: { name: "vendor" } },
    "lab",
  );
  assert.match(
    applyResource(parse(labFiles["workloads/vendor.yaml"]), "lab"),
    /created/,
  );
  assert.equal(
    getResources("deployments", "lab", "vendor")[0].status.readyReplicas,
    0,
  );
  assert.equal(S.cluster.events[0].reason, "FailedCreate");
  assert.ok(
    S.cluster.audit.some(
      (event) =>
        event.user.username.endsWith("replicaset-controller") &&
        event.responseStatus.code === 403,
    ),
  );
  S.cluster.user = "platform-admin";
  applyResource(parse(labFiles["scc/vendor-fixed-uid.yaml"]), "lab");
  grantScc("vendor-fixed-uid", "vendor", "lab");
  restartDeployment("vendor", "lab");
  assert.equal(
    getResources("deployments", "lab", "vendor")[0].status.readyReplicas,
    1,
  );
  const pod = getResources("pods", "lab")[0];
  assert.equal(
    pod.metadata.annotations["openshift.io/scc"],
    "vendor-fixed-uid",
  );
  assert.equal(pod.spec.containers[0].securityContext.runAsUser, 1001);
  S.cluster.user = "operator";
  assert.throws(
    () => applyResource(parse(labFiles["workloads/owned-root.yaml"]), "lab"),
    /Forbidden/,
  );
  assert.equal(
    roleAllows(
      "system:serviceaccount:lab:default",
      "use",
      "securitycontextconstraints",
      "lab",
      "vendor-fixed-uid",
    ),
    false,
  );
});

test("anyuid remains separate from privileged; revoking its grant affects new controller Pods", () => {
  lab();
  applyResource(
    { apiVersion: "v1", kind: "ServiceAccount", metadata: { name: "vendor" } },
    "lab",
  );
  applyResource(parse(labFiles["workloads/vendor.yaml"]), "lab");
  S.cluster.user = "platform-admin";
  grantScc("anyuid", "vendor", "lab");
  restartDeployment("vendor", "lab");
  assert.equal(
    getResources("deployments", "lab", "vendor")[0].status.readyReplicas,
    1,
  );
  const privileged = parse(labFiles["workloads/owned-root.yaml"]);
  privileged.spec.containers[0].securityContext.privileged = true;
  assert.throws(
    () => applyResource(privileged, "lab"),
    /Privileged containers are not allowed/,
  );
  grantScc("anyuid", "vendor", "lab", true);
  restartDeployment("vendor", "lab");
  assert.equal(
    getResources("deployments", "lab", "vendor")[0].status.readyReplicas,
    0,
  );
});

test("quoted pipelines/templates are tokenized without evaluating shell expressions", () => {
  const tokens = tokenize(
    `oc get pods -o json | jq '.items[] | select(.metadata.name == "vendor")'`,
  );
  assert.equal(tokens.filter((token) => token.kind === "pipe").length, 1);
  assert.equal(
    tokens.at(-1).value,
    '.items[] | select(.metadata.name == "vendor")',
  );
  assert.equal(
    tokenize(`echo '{"kind":"Pod"}' > workloads/pod.json`)[1].value,
    '{"kind":"Pod"}',
  );
  assert.throws(
    () => tokenize("oc get pods; cat secrets"),
    /control operators/,
  );
  assert.throws(() => tokenize("jq 'unfinished"), /unmatched quote/);
});

test("admission and application runtime failures remain distinct; unknown images never report Ready", () => {
  lab();
  const owned = parse(labFiles["workloads/owned-root.yaml"]);
  delete owned.spec.containers[0].securityContext.runAsUser;
  applyResource(owned, "lab");
  const pod = getResources("pods", "lab", "owned")[0];
  assert.equal(pod.metadata.annotations["openshift.io/scc"], "restricted-v3");
  assert.equal(
    pod.status.containerStatuses[0].state.waiting.reason,
    "CrashLoopBackOff",
  );
  applyResource(
    {
      apiVersion: "v1",
      kind: "Pod",
      metadata: { name: "unknown-image" },
      spec: { containers: [{ name: "app", image: "unlisted.example/app:v1" }] },
    },
    "lab",
  );
  const unknown = getResources("pods", "lab", "unknown-image")[0];
  assert.equal(
    unknown.status.containerStatuses[0].state.waiting.reason,
    "ImagePullBackOff",
  );
  assert.equal(unknown.status.containerStatuses[0].ready, false);
});

test("stored RBAC objects grant actual access and stay namespace scoped", () => {
  lab();
  S.cluster.user = "platform-admin";
  applyResource(
    {
      apiVersion: "v1",
      kind: "Secret",
      metadata: { name: "example" },
      data: { token: "dHJhaW5pbmc=" },
    },
    "lab",
  );
  applyResource(
    {
      apiVersion: "rbac.authorization.k8s.io/v1",
      kind: "Role",
      metadata: { name: "secret-reader" },
      rules: [
        { apiGroups: [""], resources: ["secrets"], verbs: ["get", "list"] },
      ],
    },
    "lab",
  );
  applyResource(
    {
      apiVersion: "rbac.authorization.k8s.io/v1",
      kind: "RoleBinding",
      metadata: { name: "read-secrets" },
      roleRef: { kind: "Role", name: "secret-reader" },
      subjects: [{ kind: "User", name: "operator" }],
    },
    "lab",
  );
  S.cluster.user = "operator";
  assert.equal(
    getResources("secrets", "lab", "example")[0].metadata.name,
    "example",
  );
  assert.throws(() => getResources("secrets", "payments"), /Forbidden/);
});
