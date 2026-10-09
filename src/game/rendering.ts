import { ctx, H, W, G, C, reduced } from "../game/runtime.js";
import { S } from "../simulation/state.js";
import { worldObjects } from "../world/locations.js";
import { scenes } from "../world/scene-model.js";
import { artwork, type ArtworkName } from "./artwork.js";
import miraAtlas from "../../public/art/mira-run.json";
import { reactionObjects, updateReaction } from "../world/reactions.js";
import walkAtlas from "../../public/art/operator-walk.json";
import { update } from "../game/movement.js";
import { placeWorldLabels } from "../world/label-layout.js";
import { syncInteractionTargets } from "../world/interaction-targets.js";
import type { WorldObject } from "../world/locations.js";
import { doorMarkerState } from "../world/door-markers.js";

export function drawRounded(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string | null,
  stroke: string | null = null,
  lw = 1,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

export function drawText(
  s: string,
  x: number,
  y: number,
  color = "#e0e9f6",
  font = "12px system-ui",
  align: CanvasTextAlign = "left",
) {
  ctx.font = font;
  ctx.textAlign = align;
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
  ctx.textAlign = "left";
}

export function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width = 2,
  dash: number[] = [],
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function glowDot(x: number, y: number, r: number, color: string) {
  const g = ctx.createRadialGradient(x, y, 1, x, y, r * 3);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

export /** Workload sprites share a camera and plinth geometry. Labels remain live data. */
function sprite(
  name: ArtworkName,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const image = artwork[name];
  if (image) ctx.drawImage(image, x - width / 2, y - height, width, height);
}
export function drawBackground(_t: number) {
  ctx.save();
  // Lift scene shadows while keeping bright signs and live evidence restrained.
  ctx.filter = "brightness(0.88) saturate(1.02)";
  ctx.drawImage(artwork[scenes[S.world.scene].art], 0, 0, W, H);
  ctx.restore();
}
export function drawPod(o: WorldObject, _t: number) {
  const labPod =
    o.id.startsWith("lab-pod:") &&
    S.cluster.resources.find(
      (p) =>
        p.kind === "Pod" &&
        p.metadata.name === o.resourceName &&
        p.metadata.namespace === o.namespace,
    );
  const failed =
    labPod &&
    !(
      labPod.status?.containerStatuses as { ready: boolean }[] | undefined
    )?.every((c) => c.ready);
  const name =
    o.id === "ledger"
      ? "database"
      : failed ||
          ((o.id === "pod1" || o.id === "pod2") && S.findings.baselineDeviation)
        ? "pod-alert"
        : "pod-blue";
  sprite(name, o.x, o.y + 35, 160, 155);
}
export function drawStation(o: WorldObject, _t: number) {
  sprite("station", o.x, o.y + 35, 150, 140);
}
export function drawNPC(o: WorldObject, _t: number) {
  const actor = G.miraReaction;
  if (
    o.id === "mira" &&
    S.world.scene === "soc" &&
    actor &&
    !actor.arrived &&
    !reduced
  ) {
    const frame = miraAtlas.frames[Math.floor(actor.step * 4) % 4],
      rect = frame.sourceRect,
      scale = miraAtlas.scaleRecommendation * 0.68;
    ctx.drawImage(
      artwork["mira-run"],
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      o.x - frame.pivot.x * scale,
      o.y + 23 - frame.pivot.y * scale,
      rect.width * scale,
      rect.height * scale,
    );
  } else
    sprite(o.art ?? (o.id === "rhea" ? "rhea" : "mira"), o.x, o.y + 23, 45, 67);
}
export function drawAvatar(_t: number) {
  // Ground stays fixed: articulated sprite cells move the boots, never the whole body.
  ctx.fillStyle = "#0009";
  ctx.beginPath();
  ctx.ellipse(S.x, S.y + 22, 15, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = G.traceOn ? "#80d8e8" : "#88dfbf";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(S.x, S.y + 22, 18, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.save();
  ctx.translate(S.x, S.y + 25);
  ctx.scale(S.facing, 1);
  if (G.walking && !reduced) {
    const frame = walkAtlas.frames[Math.floor(S.step * 8) % 8],
      rect = frame.sourceRect,
      scale = walkAtlas.scaleRecommendation * 0.68;
    ctx.drawImage(
      artwork["operator-walk"],
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      -frame.pivot.x * scale,
      -frame.pivot.y * scale,
      rect.width * scale,
      rect.height * scale,
    );
  } else ctx.drawImage(artwork.operator, -14.5, -67, 29, 67);
  ctx.restore();
}
export function drawProp(o: WorldObject) {
  if (o.action === "keycard") {
    ctx.drawImage(
      artwork.locker,
      89,
      39,
      350,
      689,
      o.x - 35,
      o.y - 122,
      70,
      145,
    );
  } else
    ctx.drawImage(
      artwork.dossier,
      19,
      80,
      478,
      364,
      o.x - 40,
      o.y - 36,
      80,
      61,
    );
}

export function drawFlows(t: number) {
  const payment = worldObjects().find(
    (o) => o.id === "pod1" || o.id === "pod2",
  );
  if (!payment) return;
  const flow = (x2: number, y2: number, color: string) => {
    line(payment.x + 25, payment.y, x2, y2, color + "99", 2, [6, 8]);
    for (let k = 0; k < 4; k++) {
      const p = (t * 0.16 + k / 4) % 1;
      glowDot(
        payment.x + 25 + (x2 - payment.x - 25) * p,
        payment.y + (y2 - payment.y) * p,
        2.5,
        color,
      );
    }
  };
  const ledger = worldObjects().find((o) => o.id === "ledger");
  if (S.policy !== "deny") {
    flow(ledger?.x ?? 980, ledger?.y ?? 250, "#71d5cc");
    if (!ledger)
      drawText(
        "ledger · worker-02 · tcp/8443",
        960,
        230,
        "#9adfd8",
        "11px ui-monospace,monospace",
        "right",
      );
  }
  if (S.env && S.policy === "none") {
    flow(1060, 455, "#ff6877");
    drawText(
      "External egress · 203.0.113.77:443",
      1055,
      482,
      "#ff9ea8",
      "11px ui-monospace,monospace",
      "right",
    );
  } else if (S.policy !== "none") {
    drawText(
      "External egress blocked",
      1040,
      470,
      "#92dbc0",
      "11px ui-monospace,monospace",
      "right",
    );
  }
}

export function drawLabels(t: number) {
  const objects = worldObjects();
  const scale = Math.max(
    0.55,
    Math.min(2, C.width / Math.max(1, C.getBoundingClientRect().width)),
  );
  const titleSize = 14 * scale,
    subSize = 12 * scale;
  const requests = objects
    .map((o) => {
      const objective = G.markerObjectives[o.id];
      const state = doorMarkerState(
        Math.hypot(S.x - o.x, S.y - o.y),
        !!objective,
      );
      const onRing = o.kind === "portal" && state === "on-ring";
      const badge = onRing || !!objective ? 28 * scale : 0;
      ctx.font = `700 ${titleSize}px JetBrains Mono,monospace`;
      const titleWidth =
        ctx.measureText(onRing ? "Enter " + o.label : o.label).width + badge;
      ctx.font = `${subSize}px Inter,system-ui`;
      const subWidth = ctx.measureText(o.sub).width;
      return {
        object: o,
        width: Math.min(
          280 * scale,
          Math.max(
            88 * scale,
            titleWidth + 30 * scale,
            Math.min(250 * scale, subWidth + 30 * scale + badge),
          ),
        ),
        height: 50 * scale,
        compactHeight: 32 * scale,
        compactWidth: Math.max(72 * scale, titleWidth + 30 * scale),
        preferredRise: o.kind === "portal" ? (o.markerRise ?? 75) : undefined,
        compactOnly: o.kind === "portal" && state === "far",
      };
    })
    .sort(
      (a, b) =>
        Math.hypot(S.x - a.object.x, S.y - a.object.y) -
        Math.hypot(S.x - b.object.x, S.y - b.object.y),
    );
  const blockers = objects
    .filter((o) => o.kind !== "portal")
    .map((o) => ({
      x: o.x - (o.kind === "npc" ? 28 : 65),
      y: o.y - (o.kind === "prop" ? 38 : 120),
      width: o.kind === "npc" ? 56 : 130,
      height: o.kind === "prop" ? 62 : 145,
    }));
  blockers.push({ x: S.x - 26, y: S.y - 78, width: 52, height: 105 });
  const canvasBounds = C.getBoundingClientRect();
  for (const selector of ["#casehud", ".hudright"]) {
    const element = document.querySelector(selector);
    if (!element) continue;
    const r = element.getBoundingClientRect();
    if (r.bottom <= canvasBounds.top || r.top >= canvasBounds.bottom) continue;
    blockers.push({
      x:
        G.cameraX +
        ((r.left - canvasBounds.left) * C.width) / canvasBounds.width,
      y:
        G.cameraY +
        ((r.top - canvasBounds.top) * C.height) / canvasBounds.height,
      width: (r.width * C.width) / canvasBounds.width,
      height: (r.height * C.height) / canvasBounds.height,
    });
  }
  const labels = placeWorldLabels(
    requests,
    { x: G.cameraX, y: G.cameraY, width: C.width, height: C.height },
    blockers,
  );
  for (const label of labels) {
    const { object: o, x, y, width, height, compact } = label;
    const objective = G.markerObjectives[o.id];
    const state = doorMarkerState(
      Math.hypot(S.x - o.x, S.y - o.y),
      !!objective,
    );
    const onRing = o.kind === "portal" && state === "on-ring";
    const highlighted = onRing || objective?.current;
    const color = highlighted ? "#4dd5fa" : "#e9edf5";
    const nearestX = Math.max(x + 8, Math.min(x + width - 8, o.x));
    const below = y > o.y;
    if (o.kind === "portal") {
      line(
        nearestX,
        below ? y : y + height,
        nearestX,
        below ? y - 17 * scale : y + height + 17 * scale,
        color + "aa",
        1,
      );
      ctx.beginPath();
      ctx.arc(
        nearestX,
        below ? y - 17 * scale : y + height + 17 * scale,
        3 * scale,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(o.x, o.y + 22, 32, 11, 0, 0, Math.PI * 2);
      ctx.fillStyle = onRing ? "#4dd5fa22" : "#080d1622";
      ctx.strokeStyle = highlighted ? "#4dd5fa" : "#e9edf580";
      ctx.lineWidth = 1.25;
      ctx.shadowColor = highlighted ? "#4dd5fa" : "transparent";
      ctx.shadowBlur = highlighted ? 12 : 0;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else line(o.x, o.y + 25, nearestX, y, "#799aab80", 1);
  }
  C.dataset.visibleLabels = String(labels.length);
  syncInteractionTargets(labels);
  if (
    G.near &&
    G.near.kind !== "portal" &&
    !G.detailOpen &&
    !G.radioOpen &&
    !G.caseOpen
  ) {
    ctx.strokeStyle = "#a5d7ec";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.ellipse(G.near.x, G.near.y + 22, 57, 22, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

export function draw(t: number) {
  G.frame++;
  const narrow = window.innerWidth <= 1000;
  const bounds = C.getBoundingClientRect();
  // Fill the viewport without stretching the isometric perspective.
  const vw = Math.max(
    220,
    Math.round((H * bounds.width) / Math.max(1, bounds.height)),
  );
  const vh = Math.round((vw * bounds.height) / Math.max(1, bounds.width));
  if (C.width !== vw) C.width = vw;
  if (C.height !== vh) C.height = vh;
  G.cameraX = narrow
    ? Math.max(0, Math.min(W - vw, S.x - vw / 2))
    : (W - vw) / 2;
  G.cameraY = Math.max(0, Math.min(H - vh, Math.max(570 - vh, S.y - vh + 45)));
  C.dataset.cameraX = String(G.cameraX);
  C.dataset.cameraY = String(G.cameraY);
  if (G.miraReaction) C.dataset.reactionX = String(G.miraReaction.x);
  C.dataset.reaction = G.miraReaction
    ? G.miraReaction.arrived
      ? "arrived"
      : "running"
    : "none";
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#253745";
  ctx.fillRect(0, 0, C.width, C.height);
  ctx.setTransform(1, 0, 0, 1, -G.cameraX, -G.cameraY);
  drawBackground(t);

  if (G.traceOn) drawFlows(t);
  const entities = [
    ...worldObjects(),
    ...reactionObjects(),
    { id: "avatar", x: S.x, y: S.y, kind: "avatar" },
  ];
  entities.sort((a, b) => a.y - b.y);
  for (const entity of entities) {
    if (entity.kind === "avatar") drawAvatar(t);
    else {
      const o = entity as WorldObject;
      if (o.kind === "pod") drawPod(o, t);
      else if (o.kind === "terminal") drawStation(o, t);
      else if (o.kind === "npc") drawNPC(o, t);
      else if (o.kind === "prop") drawProp(o);
    }
  }
  drawLabels(t);
  // foreground grain, sparking lights
  for (let i = 0; i < 20; i++) {
    let x = (i * 173 + 57) % W,
      y = (i * 89 + 33) % H;
    let alpha = 0.15 + 0.1 * Math.sin(t + i);
    ctx.fillStyle = `rgba(154,194,234,${alpha})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  if (!reduced) {
    for (let i = 0; i < 19; i++) {
      const x = ((i * 99 + t * (14 + (i % 3) * 6)) % 1250) - 35;
      const y = (i * 233) % 650;
      ctx.strokeStyle = "#b5d6ff09";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 5, y + 12);
      ctx.stroke();
    }
  }
}

export function loop(now: number) {
  if (G.stopLoop) return;
  const dt = Math.min((now - G.lastTime) / 1000 || 0, 0.045);
  G.lastTime = now;
  const t = now / 1000;
  if (!reduced || G.frame === 0 || S.started) {
    updateReaction(dt);
    update(dt);
    draw(t);
  }
  requestAnimationFrame(loop);
}
