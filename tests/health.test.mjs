import test from "node:test";
import assert from "node:assert/strict";
import {
  makeState,
  resetState,
  S,
} from "../.test-build/src/simulation/state.js";
import { applyPolicy } from "../.test-build/src/simulation/operations.js";
import { projectHealth } from "../.test-build/src/simulation/health.js";
import { synchronizeClusterMetadata } from "../.test-build/src/simulation/cluster-api.js";
import {
  discover,
  canEnterWorker,
  canEnterArchive,
} from "../.test-build/src/world/story.js";
import {
  encodeProgress,
  decodeProgress,
} from "../.test-build/src/simulation/snapshot.js";
test("default-deny degrades checkout without inventing Pod/node failures; policy union restores dependencies", () => {
  resetState();
  synchronizeClusterMetadata();
  applyPolicy("default-deny-egress");
  const impact = projectHealth(S);
  assert.equal(impact.checkout, "DEGRADED");
  assert.equal(impact.readyPods, 2);
  assert.equal(impact.dnsAllowed, false);
  assert.equal(impact.ledgerAllowed, false);
  assert.equal(impact.externalAllowed, false);
  assert.ok(impact.nodes.every((node) => node.ready));
  assert.equal(
    impact.nodes
      .find((node) => node.name === "worker-01")
      .pods.filter((p) => p.namespace === "payments").length,
    1,
  );
  assert.equal(
    impact.nodes
      .find((node) => node.name === "worker-02")
      .pods.filter((p) => p.namespace === "payments").length,
    2,
  );
  applyPolicy("payment-egress");
  const restored = projectHealth(S);
  assert.equal(restored.checkout, "HEALTHY");
  assert.equal(restored.dnsAllowed, true);
  assert.equal(restored.ledgerAllowed, true);
  assert.equal(restored.externalAllowed, false);
});
test("health requires an admitted Route, the targeted Service, and matching ready backends", () => {
  resetState();
  synchronizeClusterMetadata();
  const route = S.cluster.resources.find(
    (r) => r.kind === "Route" && r.metadata.name === "payment-api",
  );
  const service = S.cluster.resources.find(
    (r) => r.kind === "Service" && r.metadata.name === "payment-api",
  );
  assert.equal(projectHealth(S).ingressAllowed, true);
  service.spec.selector = { app: "does-not-exist" };
  assert.equal(projectHealth(S).ingressAllowed, false);
  assert.equal(
    projectHealth(S).readyPods,
    2,
    "selector mismatch is a traffic failure, not a Pod failure",
  );
  service.spec.selector = { app: "payment-api" };
  route.status.ingress[0].conditions[0].status = "False";
  assert.equal(projectHealth(S).ingressAllowed, false);
  route.status.ingress[0].conditions[0].status = "True";
  assert.equal(projectHealth(S).ingressAllowed, true);
});
test("archive key unlocks story access only; discoveries and key survive checkpoints and older saves", () => {
  const state = makeState();
  const user = state.cluster.user;
  const sccCount = state.cluster.sccs.length;
  assert.equal(canEnterArchive(state), false);
  assert.equal(discover(state, "keycard"), true);
  assert.equal(discover(state, "keycard"), false);
  assert.equal(canEnterArchive(state), true);
  assert.equal(state.cluster.user, user);
  assert.equal(state.cluster.sccs.length, sccCount);
  discover(state, "audit");
  const restored = decodeProgress(encodeProgress(state));
  assert.deepEqual(restored.story, state.story);
  const older = JSON.parse(encodeProgress(state));
  delete older.data.story;
  assert.deepEqual(decodeProgress(JSON.stringify(older)).story, {
    inventory: [],
    discoveries: [],
    notes: "",
    outageSeen: false,
    mira: { scene: "cluster", x: 895, y: 465 },
  });
  older.data.story = { inventory: ["cluster-admin"], discoveries: [] };
  assert.throws(
    () => decodeProgress(JSON.stringify(older)),
    /invalid simulation/,
  );
});

test("worker story access and notebook persist without altering API authorization", () => {
  const state = makeState();
  assert.equal(canEnterWorker(state), false);
  discover(state, "access");
  assert.equal(canEnterWorker(state), true);
  state.story.notes =
    "Review logs; do not equate API identity with human attribution.";
  state.story.outageSeen = true;
  const restored = decodeProgress(encodeProgress(state));
  assert.equal(canEnterWorker(restored), true);
  assert.equal(restored.story.notes, state.story.notes);
  assert.equal(restored.story.outageSeen, true);
  assert.equal(restored.cluster.user, "operator");
  const crash = {
    apiVersion: "v1",
    kind: "Pod",
    metadata: { name: "broken", namespace: "lab" },
    spec: { nodeName: "worker-01", containers: [] },
    status: { phase: "Running", containerStatuses: [{ ready: false }] },
  };
  state.cluster.resources.push(crash);
  assert.equal(
    projectHealth(state)
      .nodes.find((node) => node.name === "worker-01")
      .pods.find((pod) => pod.name === "broken").ready,
    false,
  );
});
