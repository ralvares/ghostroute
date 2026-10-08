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
test("each named witness occupies exactly one room; Mira's outage location persists", () => {
  const state = makeState();
  for (const location of ["cluster", "soc"]) {
    state.story.mira.scene = location;
    const actors = sceneIds.flatMap((scene) => {
      state.world.scene = scene;
      return worldObjects(state).filter((o) => o.kind === "npc");
    });
    for (const who of ["mira", "kai", "rhea", "vale"])
      assert.equal(
        actors.filter((o) => o.id === who).length,
        1,
        who + " in " + location,
      );
    assert.equal(
      decodeProgress(encodeProgress(state)).story.mira.scene,
      location,
    );
  }
});

test("legacy control-plane node names migrate to control-01 on save import", () => {
  const state = makeState();
  state.cluster.resources.find(
    (r) => r.kind === "Node" && r.metadata.name === "control-01",
  ).metadata.name = "master-01";
  const restored = decodeProgress(encodeProgress(state));
  assert.ok(
    restored.cluster.resources.some(
      (r) => r.kind === "Node" && r.metadata.name === "control-01",
    ),
  );
  assert.ok(
    !restored.cluster.resources.some(
      (r) => r.kind === "Node" && r.metadata.name === "master-01",
    ),
  );
});
