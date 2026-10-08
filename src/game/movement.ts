import { reactionObjects } from "../world/reactions.js";
import { floorPoint } from "../world/walkable.js";
import { worldObjects } from "../world/locations.js";
import { S } from "../simulation/state.js";
import { G, keys, C } from "../game/runtime.js";
import { interact } from "../world/interactions.js";
import { $ } from "../ui/dom.js";
import { toast } from "../ui/notifications.js";
import { addClue } from "../security/evidence.js";
import type { WorldObject } from "../world/locations.js";

/** Mouse, visible labels and keyboard activation all approach the same object. */
export function approachObject(hit: WorldObject) {
  if (blocked()) return;
  C.focus();
  G.pending = hit;
  const angle = Math.atan2(S.y - hit.y, S.x - hit.x);
  G.target = floorPoint(
    { x: hit.x + Math.cos(angle) * 34, y: hit.y + Math.sin(angle) * 34 },
    S.world.scene,
  );
  if (Math.hypot(S.x - hit.x, S.y - hit.y) < 70) {
    G.target = null;
    G.pending = null;
    interact(hit);
  }
}

export function nearest() {
  let best: WorldObject | null = null,
    dist = 100;
  for (const o of [...worldObjects(), ...reactionObjects()]) {
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
    document.activeElement instanceof HTMLTextAreaElement ||
    (G.miraReaction !== null && !G.miraReaction.arrived) ||
    G.detailOpen ||
    G.endOpen ||
    G.caseOpen ||
    !S.started ||
    !G.active
  );
}

export function update(dt: number) {
  G.walking = false;
  if (!S.started || blocked()) return;
  const previous = { x: S.x, y: S.y };
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
    S.x += (dx / n) * dt * 260;
    S.y += (dy / n) * dt * 260;
  } else if (G.target) {
    const dist = Math.hypot(G.target.x - S.x, G.target.y - S.y);
    if (dist > 5) {
      let speed = Math.min(dt * 370, dist);
      S.x += ((G.target.x - S.x) / dist) * speed;
      S.y += ((G.target.y - S.y) / dist) * speed;
    } else {
      G.target = null;
      if (G.pending) {
        const p = G.pending;
        G.pending = null;
        interact(p);
      }
    }
  }
  const safe = floorPoint({ x: S.x, y: S.y }, S.world.scene);
  S.x = safe.x;
  S.y = safe.y;
  const distance = Math.hypot(S.x - previous.x, S.y - previous.y);
  G.walking = distance > 0.01;
  if (G.walking) {
    S.step += distance / 180;
    if (Math.abs(S.x - previous.x) > 0.01) S.facing = S.x > previous.x ? 1 : -1;
  }
  G.near = nearest();
  $("nearby").hidden = !G.near || G.radioOpen || G.detailOpen || G.caseOpen;
  $("terminalBtn").hidden = G.near?.id !== "ops";
  if (G.near) {
    $("nearbyText").textContent =
      G.near.kind === "npc"
        ? "Talk to " + G.near.label
        : G.near.id === "ops"
          ? "Open OpenShift terminal"
          : G.near.kind === "portal"
            ? G.near.sub
            : "Investigate " + G.near.label;
  }
  if (G.traceOn && performance.now() > G.traceEnd) {
    G.traceOn = false;
    toast("Trace Vision faded. Press Space to reactivate.");
  }
  const payment = worldObjects().find(
    (object) => object.id === "pod1" || object.id === "pod2",
  );
  if (
    G.traceOn &&
    payment &&
    Math.hypot(S.x - payment.x, S.y - payment.y) < 125
  ) {
    addClue("trace");
  }
}

export function worldPos(e: MouseEvent) {
  const r = C.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * C.width + G.cameraX,
    y: ((e.clientY - r.top) / r.height) * C.height + G.cameraY,
  };
}
