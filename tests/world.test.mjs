import test from "node:test";
import assert from "node:assert/strict";
import { makeState } from "../.test-build/src/simulation/state.js";
import { worldObjects } from "../.test-build/src/world/locations.js";
import { scenes, sceneIds } from "../.test-build/src/world/scene-model.js";
import { onFloor, floorPoint } from "../.test-build/src/world/walkable.js";
import {
  encodeProgress,
  decodeProgress,
} from "../.test-build/src/simulation/snapshot.js";
test("cluster buildings contain worker rooms; only scheduled Pods appear inside those rooms", () => {
  const state = makeState();
  for (const scene of ["district", "soc", "external", "cluster"]) {
    state.world.scene = scene;
    assert.equal(worldObjects(state).filter((o) => o.kind === "pod").length, 0);
  }
  state.world.scene = "worker-01";
  assert.equal(worldObjects(state).filter((o) => o.kind === "pod").length, 1);
  assert.equal(
    worldObjects(state).find((o) => o.kind === "pod").namespace,
    "payments",
  );
  state.world.scene = "worker-02";
  assert.deepEqual(
    worldObjects(state)
      .filter((o) => o.kind === "pod")
      .map((o) => o.label),
    ["payment-api", "ledger"],
  );
  state.cluster.resources.push({
    apiVersion: "v1",
    kind: "Pod",
    metadata: { name: "vendor", namespace: "lab" },
    spec: { nodeName: "worker-01", containers: [] },
  });
  assert.ok(!worldObjects(state).some((o) => o.resourceName === "vendor"));
  state.world.scene = "worker-01";
  assert.ok(
    worldObjects(state).some(
      (o) => o.resourceName === "vendor" && o.namespace === "lab",
    ),
  );
  assert.ok(!worldObjects(state).some((o) => o.kind === "deployment"));
});
test("scene spawns and projected doorway approaches remain on walkable floors", () => {
  const state = makeState();
  for (const scene of sceneIds) {
    assert.ok(onFloor(scenes[scene].spawn, scene), scene + " spawn");
    state.world.scene = scene;
    for (const portal of worldObjects(state).filter(
      (o) => o.kind === "portal",
    )) {
      const point = floorPoint(portal, scene);
      assert.ok(onFloor(point, scene), scene + " portal approach");
      assert.ok(
        Math.hypot(point.x - portal.x, point.y - portal.y) < 60,
        scene + " reachable portal",
      );
    }
  }
});
test("room and visited scenes persist; unknown scene imports reject", () => {
  const state = makeState();
  state.world.scene = "worker-02";
  state.world.visited.push("cluster", "worker-02");
  const restored = decodeProgress(encodeProgress(state));
  assert.deepEqual(restored.world, state.world);
  const bad = JSON.parse(encodeProgress(state));
  bad.data.world.scene = "imaginary";
  assert.throws(
    () => decodeProgress(JSON.stringify(bad)),
    /invalid simulation/,
  );
});
