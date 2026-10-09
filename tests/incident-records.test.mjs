import test from "node:test";
import assert from "node:assert/strict";
import {
  S,
  resetState,
  replaceState,
} from "../.test-build/src/simulation/state.js";
import {
  incidentRecords,
  incidentRecordStatus,
  reviewedIncidentRecords,
} from "../.test-build/src/missions/incident-records.js";
import {
  readVirtualFile,
  writeVirtualFile,
  changeDirectory,
} from "../.test-build/src/simulation/filesystem.js";
import {
  observeIncidentCommand,
  explainIncident,
} from "../.test-build/src/missions/incident.js";
import {
  collectEvidence,
  applyPolicy,
  removeTelemetry,
} from "../.test-build/src/simulation/operations.js";
import { clusterCommand } from "../.test-build/src/terminal/cluster-shell.js";
import {
  encodeProgress,
  decodeProgress,
} from "../.test-build/src/simulation/snapshot.js";
import { incidentFiles } from "../.test-build/src/missions/story.js";
import { collectedCommands } from "../.test-build/src/missions/command-leads.js";
import { registerDocuments } from "../.test-build/src/simulation/filesystem.js";

test("fixing the incident first retains all five original observations across save/resume", async () => {
  resetState();
  registerDocuments(incidentFiles);
  const originals = Object.fromEntries(
    Object.entries(incidentRecords).map(([id, r]) => [
      id,
      readVirtualFile("~/" + r.path),
    ]),
  );
  removeTelemetry();
  applyPolicy("default-deny-egress");
  applyPolicy("payment-egress");
  assert.equal(S.env, false);
  assert.equal(S.policy, "allow");
  assert.equal(
    S.evidence.size,
    0,
    "remediation does not fabricate evidence review",
  );
  replaceState(decodeProgress(encodeProgress(S)));
  changeDirectory("~/case/incident-018");
  for (const [id, r] of Object.entries(incidentRecords)) {
    assert.equal(readVirtualFile("~/" + r.path), originals[id]);
    const command = "cat " + r.path.split("/").at(-1);
    const response = await clusterCommand(command);
    assert.equal(response.error, undefined);
    const reviewed = observeIncidentCommand(command, response.stdout, true);
    assert.deepEqual(reviewed, [id]);
    for (const record of reviewed) collectEvidence(record);
  }
  assert.equal(S.evidence.size, 5);
  assert.match(incidentRecordStatus(S, "policy"), /blocked/);
  assert.match(incidentRecordStatus(S, "env"), /removed/);
  assert.ok(
    collectedCommands(S)
      .flatMap((l) => l.commands)
      .includes("cat ~/case/incident-018/networkpolicies-before.json"),
  );
  assert.equal(S.env, false, "reviewing archived config never reapplies it");
  assert.equal(S.policy, "allow");
  for (const command of [
    "cat ~/audit/kube-apiserver.log",
    "cat ~/case/release-job.json",
    "cat ~/case/permission-review.yaml",
  ]) {
    const response = await clusterCommand(command);
    observeIncidentCommand(command, response.stdout, !response.error);
  }
  assert.match(explainIncident("release-import"), /CAUSE VERIFIED/);
  assert.equal(
    S.incident.explained,
    true,
    "cause correlation is still possible after an early fix",
  );
  assert.equal(
    (
      await clusterCommand(
        "oc exec deployment/payment-api -n payments -- curl -I http://ledger:8443/health",
      )
    ).error ?? false,
    false,
  );
  assert.equal(
    (
      await clusterCommand(
        "oc exec deploy/payment-api -n payments -- curl -I https://203.0.113.77/upload",
      )
    ).exitCode,
    28,
  );
  assert.ok(S.checked.has("positive"));
  assert.ok(S.checked.has("negative"));
});
test("retained files are immutable and reviews require seeing the evidence rather than a failed or unrelated command", () => {
  resetState();
  const r = incidentRecords.env;
  assert.throws(() => writeVirtualFile("~/" + r.path, "tampered"), /read-only/);
  assert.deepEqual(
    observeIncidentCommand("cat ~/" + r.path, r.content, false),
    [],
  );
  assert.deepEqual(
    reviewedIncidentRecords(
      "cat ~/" + r.path,
      "apiVersion: apps/v1",
      "/home/operator",
    ),
    [],
  );
  assert.deepEqual(
    reviewedIncidentRecords(
      "echo '" + r.content + "'",
      r.content,
      "/home/operator",
    ),
    [],
  );
  assert.deepEqual(
    reviewedIncidentRecords(
      "cat ~/unrelated.yaml",
      r.content,
      "/home/operator",
    ),
    [],
  );
  assert.deepEqual(
    reviewedIncidentRecords(
      "cat ./deployment-before.yaml | less",
      r.content,
      "/home/operator/case/incident-018",
    ),
    ["env"],
  );
  assert.equal(S.evidence.size, 0);
});
