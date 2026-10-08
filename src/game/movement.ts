import { objects } from "../world/locations.js";
import { S } from "../simulation/state.js";
import { G, keys, C, H } from "../game/runtime.js";
import { interact } from "../world/interactions.js";
import { $ } from "../ui/dom.js";
import { toast } from "../ui/notifications.js";
import { addClue } from "../security/evidence.js";
import type { WorldObject } from "../world/locations.js";

export function nearest() {
  let best: WorldObject | null = null,
    dist = 100;
  for (const o of objects) {
    const d = Math.hypot(S.x - o.x, S.y - o.y);
    if (d < dist) {
      dist = d;
      best = o;
    }
  }
  return best;
}

export function blocked() {
  return (
    G.terminalOpen ||
    G.detailOpen ||
    G.endOpen ||
    G.caseOpen ||
    !S.started ||
    !G.active
  );
}

export function update(dt: number) {
  if (!S.started || blocked()) return;
  let dx = 0,
    dy = 0;
  if (keys.has("w") || keys.has("arrowup")) dy--;
  if (keys.has("s") || keys.has("arrowdown")) dy++;
  if (keys.has("a") || keys.has("arrowleft")) dx--;
  if (keys.has("d") || keys.has("arrowright")) dx++;
  if (dx || dy) {
    G.target = null;
    G.pending = null;
    let n = Math.hypot(dx, dy);
    S.x += (dx / n) * dt * 208;
    S.y += (dy / n) * dt * 208;
    S.step += dt * 3.1;
  } else if (G.target) {
    const dist = Math.hypot(G.target.x - S.x, G.target.y - S.y);
    if (dist > 5) {
      let speed = Math.min(dt * 240, dist);
      S.x += ((G.target.x - S.x) / dist) * speed;
      S.y += ((G.target.y - S.y) / dist) * speed;
      S.step += dt * 2.9;
    } else {
      G.target = null;
      if (G.pending) {
        const p = G.pending;
        G.pending = null;
        interact(p);
      }
    }
  }
  S.x = Math.max(55, Math.min(1118, S.x));
  S.y = Math.max(105, Math.min(594, S.y));
  G.near = nearest();
  $("nearby").hidden =
    !G.near || G.radioOpen || G.terminalOpen || G.detailOpen || G.caseOpen;
  if (G.near) {
    $("nearbyText").textContent =
      G.near.kind === "npc"
        ? "Talk to " + G.near.label
        : G.near.id === "ops"
          ? "Open OpenShift terminal"
          : "Investigate " + G.near.label;
  }
  if (G.traceOn && performance.now() > G.traceEnd) {
    G.traceOn = false;
    toast("Trace Vision faded. Press Space to reactivate.");
  }
  if (G.traceOn && Math.hypot(S.x - objects[1].x, S.y - objects[1].y) < 125) {
    addClue("trace");
  }
}

export function worldPos(e: MouseEvent) {
  const r = C.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * C.width + G.cameraX,
    y: ((e.clientY - r.top) / r.height) * H,
  };
}
