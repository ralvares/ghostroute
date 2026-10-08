import test from "node:test";
import assert from "node:assert/strict";
import { resetState, S } from "../.test-build/src/simulation/state.js";
import {
  observeIncidentCommand,
  explainIncident,
} from "../.test-build/src/missions/incident.js";
import { incidentFiles } from "../.test-build/src/missions/story.js";
import {
  encodeProgress,
  decodeProgress,
} from "../.test-build/src/simulation/snapshot.js";
import { roleAllows } from "../.test-build/src/security/rbac.js";
test("first incident needs linked audit, delivery record and permission evidence before it can close", () => {
  resetState();
  assert.throws(() => explainIncident("release-import"), /Read the audit/);
  observeIncidentCommand(
    "cat case/release-job.json",
    incidentFiles["case/release-job.json"],
    true,
  );
  assert.throws(() => explainIncident("release-import"), /Read the audit/);
  observeIncidentCommand(
    "cat audit/kube-apiserver.log",
    JSON.stringify(S.cluster.audit[0]),
    true,
  );
  observeIncidentCommand(
    "cat case/permission-review.yaml",
    incidentFiles["case/permission-review.yaml"],
    false,
  );
  assert.throws(() => explainIncident("release-import"), /Read the audit/);
  observeIncidentCommand(
    "cat case/permission-review.yaml",
    incidentFiles["case/permission-review.yaml"],
    true,
  );
  assert.throws(() => explainIncident("stolen-token"), /does not match/);
  assert.match(
    explainIncident("release-import"),
    /release-184 imported an unreviewed/,
  );
  assert.equal(S.incident.explained, true);
  S.cluster.audit[0].responseStatus.code = 403;
  assert.throws(() => explainIncident("release-import"), /does not support/);
});
test("reload preserves deleted controls; only legacy saves receive new incident fixtures", () => {
  resetState();
  S.cluster.resources = S.cluster.resources.filter(
    (r) => r.metadata.name !== "release-bot",
  );
  const saved = JSON.parse(encodeProgress(S));
  assert.ok(
    !decodeProgress(JSON.stringify(saved)).cluster.resources.some(
      (r) => r.metadata.name === "release-bot",
    ),
  );
  delete saved.data.incident;
  assert.ok(
    decodeProgress(JSON.stringify(saved)).cluster.resources.some(
      (r) => r.metadata.name === "release-bot",
    ),
  );
});
test("a namespace administrator binding cannot grant node access or invented verbs", () => {
  resetState();
  S.cluster.resources.push({
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "RoleBinding",
    metadata: { name: "test", namespace: "payments" },
    subjects: [{ kind: "User", name: "reader" }],
    roleRef: { kind: "ClusterRole", name: "admin" },
  });
  assert.equal(roleAllows("reader", "patch", "nodes", "payments"), false);
  assert.equal(roleAllows("reader", "use", "configmaps", "payments"), false);
  assert.equal(roleAllows("reader", "get", "configmaps", "payments"), true);
});
