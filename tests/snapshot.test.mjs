import test from "node:test";
import assert from "node:assert/strict";
import { projectIncident } from "../.test-build/src/simulation/incident-controller.js";
import { S, resetState } from "../.test-build/src/simulation/state.js";
import {
  encodeProgress,
  decodeProgress,
} from "../.test-build/src/simulation/snapshot.js";
import {
  removeTelemetry,
  applyPolicy,
  collectEvidence,
} from "../.test-build/src/simulation/operations.js";

test("portable checkpoints restore Sets, lab grants, history and computed infrastructure", () => {
  resetState();
  S.started = true;
  S.x = 650;
  S.cluster.ownedNamespaces.add("lab");
  S.cluster.files["workloads/notes.json"] = '{"case":"018"}';
  S.history.push("oc project lab");
  S.cluster.resources[0].extension = { $set: ["literal-object"] };
  collectEvidence("rhacs");
  removeTelemetry();
  applyPolicy("payment-egress");
  const restored = decodeProgress(encodeProgress(S));
  assert.equal(restored.started, true);
  assert.equal(restored.x, 650);
  assert.equal(restored.env, false);
  assert.equal(restored.podRev, 2);
  assert.equal(restored.policy, "allow");
  assert.equal(restored.findings.unrestrictedEgress, false);
  assert.ok(restored.evidence.has("rhacs"));
  assert.ok(restored.cluster.ownedNamespaces.has("lab"));
  assert.equal(
    restored.cluster.files["workloads/notes.json"],
    '{"case":"018"}',
  );
  assert.deepEqual(restored.history, ["oc project lab"]);
  assert.deepEqual(restored.cluster.resources[0].extension, {
    $set: ["literal-object"],
  });
  assert.equal(encodeProgress(restored), encodeProgress(S));
  restored.cluster.resources = restored.cluster.resources.filter(r => r.kind !== "NetworkPolicy");
  projectIncident(restored,false);
  assert.equal(restored.policy, "none"); // projection is rebuilt from retained resources
});

test("damaged or incompatible imports reject without changing the live incident", () => {
  resetState();
  const before = S;
  for (const invalid of [
    "not JSON",
    "{}",
    '{"format":"nexus-progress","version":9,"data":{}}',
  ])
    assert.throws(() => decodeProgress(invalid));
  const saved = JSON.parse(encodeProgress(S));
  saved.data.evidence = ["invented-clue"];
  assert.throws(
    () => decodeProgress(JSON.stringify(saved)),
    /invalid simulation/,
  );
  assert.equal(S, before);
  assert.equal(S.evidence.size, 0);
});
