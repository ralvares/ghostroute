import test from "node:test";
import assert from "node:assert/strict";
import {
  placeWorldLabels,
  overlaps,
} from "../.test-build/src/world/label-layout.js";
import { worldObjects } from "../.test-build/src/world/locations.js";
import { makeState } from "../.test-build/src/simulation/state.js";
for (const scene of [
  "district",
  "soc",
  "cluster",
  "worker-01",
  "worker-02",
  "archive",
])
  test("labels stay inside viewport and avoid sprites in " + scene, () => {
    const state = makeState();
    state.world.scene = scene;
    const objects = worldObjects(state),
      blockers = objects
        .filter((o) => o.kind !== "portal")
        .map((o) => ({ x: o.x - 65, y: o.y - 120, width: 130, height: 145 }));
    for (const viewport of [
      { x: 0, y: 0, width: 1200, height: 650 },
      { x: 220, y: 40, width: 760, height: 610 },
    ]) {
      const labels = placeWorldLabels(
        objects.map((object) => ({
          object,
          width: 220,
          height: 44,
          compactHeight: 26,
        })),
        viewport,
        blockers,
      );
      assert.ok(labels.length > 0);
      for (const [i, label] of labels.entries()) {
        assert.ok(
          label.x >= viewport.x &&
            label.x + label.width <= viewport.x + viewport.width,
        );
        assert.ok(
          label.y >= viewport.y &&
            label.y + label.height <= viewport.y + viewport.height,
        );
        assert.ok(
          ![...blockers, ...labels.slice(0, i)].some((b) => overlaps(label, b)),
        );
      }
    }
  });
