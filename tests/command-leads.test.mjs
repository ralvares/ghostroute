import test from "node:test";
import assert from "node:assert/strict";
import { makeState } from "../.test-build/src/simulation/state.js";
import { collectedCommands } from "../.test-build/src/missions/command-leads.js";
import { discover } from "../.test-build/src/world/story.js";
import {
  encodeProgress,
  decodeProgress,
} from "../.test-build/src/simulation/snapshot.js";

test("collected commands follow discoveries and persist without overwriting handwritten notes", () => {
  const state = makeState();
  state.story.notes = "My hypothesis: review the release import.";
  assert.deepEqual(collectedCommands(state), []);
  discover(state, "audit");
  const commands = collectedCommands(state).flatMap((l) => l.commands);
  assert.ok(commands.includes("cat ~/case/release-job.json"));
  assert.ok(
    commands.some((c) => c.startsWith("jq ") && c.includes("requestObject")),
  );
  assert.equal(
    commands.some((c) => c.includes("oc apply")),
    false,
    "uncollected containment guidance remains hidden",
  );
  const restored = decodeProgress(encodeProgress(state));
  assert.deepEqual(collectedCommands(restored), collectedCommands(state));
  assert.equal(
    restored.story.notes,
    "My hypothesis: review the release import.",
  );
  discover(restored, "boundary");
  assert.ok(
    collectedCommands(restored).some(
      (l) =>
        l.changes &&
        l.commands.includes(
          "oc apply -f ~/policies/payments-egress.yaml -n payments",
        ),
    ),
  );
});
test("chapter commands unlock with the interview and dossier rather than skipping investigation", () => {
  const state = makeState();
  state.campaign.active = 1;
  assert.deepEqual(collectedCommands(state), []);
  state.campaign.interviews.push("kai");
  assert.ok(
    collectedCommands(state).some((l) =>
      l.commands.includes("cat ~/cases/02/briefing.txt"),
    ),
  );
  assert.equal(
    collectedCommands(state).some((l) => l.changes),
    false,
  );
  state.campaign.artifactFound = true;
  assert.ok(
    collectedCommands(state).some(
      (l) =>
        l.changes &&
        l.commands.some((c) => c.startsWith("oc apply -f ~/cases/02/")),
    ),
  );
});
test("command plans put identities before workloads and restart a Deployment consumer for rotated environment values", () => {
  const state = makeState();
  state.campaign.active = 4;
  state.campaign.artifactFound = true;
  const manifestCommands = collectedCommands(state).find(
    (l) => l.source === "Dossier: resource changes",
  ).commands;
  assert.ok(
    manifestCommands.findIndex((c) => c.includes("identity.yaml")) <
      manifestCommands.findIndex((c) => c.includes("vendor.yaml")),
  );
  state.campaign.active = 19;
  const commands = collectedCommands(state).flatMap((l) => l.commands);
  assert.ok(
    commands.some((c) =>
      c.startsWith("oc rollout restart deployment/legacy-consumer"),
    ),
  );
  assert.ok(
    !commands.some((c) => c.startsWith("oc delete pod legacy-consumer")),
  );
});
