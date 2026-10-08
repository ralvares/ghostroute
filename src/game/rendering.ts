import { ctx, H, W, G, C, reduced } from "../game/runtime.js";
import { S } from "../simulation/state.js";
import { objects } from "../world/locations.js";
import { update } from "../game/movement.js";
import type { WorldObject } from "../world/locations.js";

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

export function fillPolygon(
  points: [number, number][],
  fill: string,
  stroke: string,
) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(...points[i]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

export function drawBackground(t: number) {
  const gr = ctx.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "#19243c");
  gr.addColorStop(1, "#0a121f");
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, W, H);
  // floor panels, gutters and a horizon of server architecture
  for (let x = 24; x < W; x += 57) {
    for (let y = 30; y < H; y += 57) {
      drawRounded(
        x,
        y,
        51,
        51,
        5,
        (x + y) % 3 ? "#ffffff03" : "#88aaff04",
        "#ffffff05",
      );
    }
  }
  for (let x = 0; x < W; x += 57) line(x, 0, x, H, "#5371a70a");
  for (let y = 0; y < H; y += 57) line(0, y, W, y, "#5371a70a");
  // edge conduits
  line(0, 590, W, 590, "#4e76983c", 16);
  line(0, 590, W, 590, "#74b8b94b", 2);
  drawRounded(0, 0, W, 78, 0, "#0b111ba6");
  drawText(
    "OPENSHIFT PLATFORM · CLUSTER / prod-east",
    24,
    33,
    "#91a9c4",
    "bold 12px ui-monospace,monospace",
  );
  drawText(
    "WORKER NODES · APPLICATION PLANE",
    390,
    113,
    "#87a4c9",
    "bold 11px ui-monospace,monospace",
  );
  drawText(
    "PAYMENTS NAMESPACE (logical scope across both nodes)",
    389,
    152,
    "#80d9e0",
    "11px ui-monospace,monospace",
  );
  ctx.strokeStyle = "#429ca777";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 7]);
  ctx.strokeRect(374, 160, 554, 328);
  ctx.setLineDash([]);
  // floating pipes/wires
  for (let i = 0; i < 7; i++) {
    const x = 24 + i * 186;
    line(x, 75, x, 120, "#83a2c037", 5);
    glowDot(x, 118, 1.5, "#5ca8c4");
  }
  // city windows / distant racks
  for (let i = 0; i < 10; i++) {
    let x = 15 + i * 123;
    drawRounded(x, 60, 57, 42, 5, "#1e2b46", "#33476b");
    for (let j = 0; j < 4; j++)
      drawRounded(
        x + 8 + j * 11,
        69,
        6,
        17,
        2,
        j % 3 === 0 ? "#6b8bba" : "#30415f",
      );
  }
  // center corridor floor
  drawRounded(310, 492, 639, 110, 13, "#24324866", "#34496388");
  drawRounded(354, 515, 556, 50, 7, "#91b9bd12", "#5c859a2b");
  // external edge gateway
  drawRounded(975, 180, 175, 322, 15, "#281a2b9c", "#67435e");
  drawRounded(993, 222, 137, 198, 12, "#180d20", "#ad445f");
  drawText("EXTERNAL", 1061, 202, "#faafaf", "bold 13px system-ui", "center");
  drawText("NETWORK", 1061, 219, "#ba8c9d", "11px system-ui", "center");
  for (let i = 0; i < 6; i++) {
    const yy = 252 + i * 26;
    line(1015, yy, 1109, yy, "#9f315a6b", 7);
    glowDot(1110, yy, 2.2, "#f26c6c");
  }
  drawText(
    "203.0.113.77",
    1062,
    458,
    "#ffa3a3",
    "12px ui-monospace,monospace",
    "center",
  );
}

export function drawNode(x: number, y: number, id: string, healthy = true) {
  ctx.save();
  ctx.shadowColor = "#050815aa";
  ctx.shadowBlur = 27;
  ctx.shadowOffsetY = 13;
  drawRounded(x, y, 252, 283, 16, "#1a2d44", "#57718f", 2);
  ctx.restore();
  drawRounded(x + 3, y + 3, 246, 65, 12, "#293e5d");
  drawRounded(x + 14, y + 13, 39, 37, 9, "#112038", "#587896");
  drawText("▦", x + 24, y + 41, "#9dd4ea", "25px ui-monospace,monospace");
  drawText(id, x + 62, y + 32, "#f1f5ff", "bold 16px system-ui");
  drawText(
    "RUNNING  •  READY",
    x + 62,
    y + 52,
    healthy ? "#8be0c3" : "#f59c95",
    "bold 10px ui-monospace,monospace",
  );
  for (let i = 0; i < 4; i++) {
    drawRounded(x + 17 + i * 57, y + 78, 46, 13, 4, "#1d3754", "#36526f");
    drawRounded(x + 24 + i * 57, y + 82, 15, 4, 2, "#5ab9aa");
  }
  drawRounded(x + 12, y + 109, 228, 157, 12, "#0b1627", "#45617e");
}

export function drawPod(o: WorldObject, t: number) {
  const led = o.id === "ledger",
    broken = S.policy === "deny",
    isPayment = !led;
  const x = o.x,
    y = o.y;
  ctx.save();
  ctx.shadowBlur = 18;
  ctx.shadowColor = led ? "#66dfcc25" : "#6ebced38";
  drawRounded(
    x - 49,
    y - 32,
    98,
    84,
    12,
    "#263b55",
    led ? "#67aeaa" : "#5688ae",
    2,
  );
  ctx.restore();
  // container 3D face
  fillPolygon(
    [
      [x - 36, y - 29],
      [x - 25, y - 40],
      [x + 38, y - 40],
      [x + 49, y - 29],
    ],
    "#456484",
    "#617e9e",
  );
  drawRounded(x - 34, y - 26, 69, 49, 7, "#111f32", "#7c9cb3");
  for (let i = 0; i < 3; i++) {
    drawRounded(x - 26, y - 17 + i * 12, 46, 8, 2, "#2f4965");
    glowDot(x + 24, y - 13 + i * 12, 2, broken ? "#ffa096" : "#78dfbc");
  }
  drawRounded(x - 40, y + 27, 80, 15, 4, broken ? "#6f2a35" : "#225d5a");
  drawText(
    led ? "LEDGER" : "PAYMENT",
    x,
    y + 38,
    broken ? "#ffd3d2" : "#c3fdf1",
    "bold 10px ui-monospace,monospace",
    "center",
  );
  if (isPayment && S.podRev > 1) {
    let pct = (t % 2.3) / 2.3;
    ctx.strokeStyle = "#9dc8ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 43, pct * Math.PI * 2, (pct + 0.6) * Math.PI * 2);
    ctx.stroke();
  }
  if (isPayment && G.traceOn) {
    glowDot(x + 39, y - 28, 4, S.policy === "allow" ? "#68e9ce" : "#ff7373");
  }
}

export function drawStation(o: WorldObject, t: number) {
  let x = o.x,
    y = o.y;
  if (o.id === "rhacs") {
    ctx.save();
    ctx.shadowColor = "#ef5e6777";
    ctx.shadowBlur = 20;
    drawRounded(x - 60, y - 62, 120, 103, 12, "#273549", "#db767f", 2);
    ctx.restore();
    drawRounded(x - 44, y - 50, 88, 54, 6, "#111827", "#607a95");
    ctx.fillStyle = "#e84c57";
    ctx.beginPath();
    ctx.arc(x - 20, y - 24, 8, 0, Math.PI * 2);
    ctx.fill();
    drawText("!", x - 20, y - 19, "white", "bold 12px system-ui", "center");
    line(x - 3, y - 31, x + 31, y - 31, "#e76b74", 3);
    line(x - 3, y - 21, x + 20, y - 21, "#b97081", 3);
    drawText(
      "BASELINE",
      x,
      y + 31,
      "#ffe9ea",
      "bold 11px ui-monospace,monospace",
      "center",
    );
  }
  if (o.id === "ops") {
    drawRounded(x - 75, y - 42, 150, 96, 13, "#263c55", "#77afbf", 2);
    drawRounded(x - 59, y - 29, 118, 54, 8, "#071826", "#3d7989");
    drawText(
      "> oc _",
      x - 47,
      y + 5,
      "#95f6bf",
      "bold 18px ui-monospace,monospace",
    );
    drawText(
      "OPERATIONS",
      x,
      y + 42,
      "#e0f8fb",
      "bold 11px ui-monospace,monospace",
      "center",
    );
    glowDot(x + 61, y - 34, 2.8, "#89e2b0");
  }
}

export function drawNPC(o: WorldObject, t: number) {
  let x = o.x,
    y = o.y;
  ctx.save();
  ctx.shadowColor = "#000a";
  ctx.shadowBlur = 11;
  ctx.fillStyle = "#070d19b0";
  ctx.beginPath();
  ctx.ellipse(x, y + 24, 19, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  const outfit = o.id === "rhea" ? "#734876" : "#3e7795";
  drawRounded(x - 15, y - 2, 30, 29, 9, outfit, "#bdd0e1");
  drawRounded(x - 12, y - 23, 24, 26, 10, "#cc9a7d", "#f2d1b0");
  drawRounded(
    x - 14,
    y - 26,
    28,
    8,
    5,
    o.id === "rhea" ? "#32263b" : "#293f51",
  );
  line(x - 14, y + 13, x - 20, y + 25, "#bd9a87", 6);
  line(x + 14, y + 13, x + 20, y + 25, "#bd9a87", 6);
  line(x - 7, y + 28, x - 10, y + 36, "#607492", 7);
  line(x + 7, y + 28, x + 10, y + 36, "#607492", 7);
  drawText(o.label, x, y - 45, "#f3e3ee", "bold 12px system-ui", "center");
  glowDot(x + 19, y - 32, 2.5, "#f6c683");
}

export function drawAvatar(t: number) {
  const bob = Math.sin(S.step * 11) * 2,
    x = S.x,
    y = S.y + bob;
  // shadow, boots, arms, jacket, skin and the red fedora
  ctx.fillStyle = "#000a";
  ctx.beginPath();
  ctx.ellipse(x, y + 23, 18, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  const walk = Math.sin(S.step * 8) * 4;
  line(x - 7, y + 16, x - 9 + walk, y + 26, "#4b5667", 9);
  line(x + 7, y + 16, x + 9 - walk, y + 26, "#4b5667", 9);
  line(x - 10 + walk, y + 27, x - 4 + walk, y + 29, "#142037", 7);
  line(x + 9 - walk, y + 27, x + 16 - walk, y + 29, "#142037", 7);
  drawRounded(x - 14, y - 7, 28, 28, 8, "#d9e7ee", "#526980");
  drawRounded(x - 11, y - 4, 22, 22, 5, "#384f65");
  line(x - 13, y, x - 19 - walk, y + 15, "#d6c3b7", 6);
  line(x + 13, y, x + 19 + walk, y + 15, "#d6c3b7", 6);
  drawRounded(x - 11, y - 26, 22, 22, 10, "#d6a98c", "#eec2a1");
  drawRounded(x - 9, y - 22, 18, 7, 3, "#302b32");
  drawRounded(x - 11, y - 14, 22, 4, 2, "#1c2731");
  // fedora crown + brim
  drawRounded(x - 11, y - 37, 22, 15, 5, "#d91d23", "#ff8c83", 1.5);
  drawRounded(x - 10, y - 29, 20, 4, 2, "#341e29");
  drawRounded(x - 21, y - 26, 42, 8, 5, "#ec2027", "#ff8e8b", 1.5);
  if (G.traceOn) {
    ctx.strokeStyle = "#7ae7ed70";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y - 8, 31 + Math.sin(t * 3) * 3, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawFlows(t: number) {
  const a = objects.find((x) => x.id === "pod1")!,
    b = objects.find((x) => x.id === "pod2")!,
    ledger = objects.find((x) => x.id === "ledger")!,
    edge = objects.find((x) => x.id === "edge")!;
  const flow = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    velocity: number,
    weight = 2,
  ) => {
    line(x1, y1, x2, y2, color + "70", weight, [6, 9]);
    for (let k = 0; k < 3; k++) {
      const p = (t * velocity + k / 3) % 1;
      glowDot(x1 + (x2 - x1) * p, y1 + (y2 - y1) * p, 2.5, color);
    }
  };
  flow(a.x + 20, a.y, ledger.x - 14, ledger.y + 10, "#5ce5c8", 0.13);
  flow(b.x, b.y - 29, ledger.x, ledger.y + 15, "#5ce5c8", 0.15);
  if (S.policy === "none") {
    if (S.env)
      flow(a.x + 36, a.y - 20, edge.x - 66, edge.y, "#fd7776", 0.17, 3);
    else flow(a.x + 36, a.y - 20, edge.x - 66, edge.y, "#f6aa5988", 0.08, 1);
  }
  if (S.policy !== "none") {
    line(920, 325, 971, 325, "#e46b77", 3, [4, 5]);
    drawRounded(929, 303, 41, 34, 8, "#451a2d", "#dc6474");
    drawText("×", 950, 327, "#ffb7b7", "bold 25px system-ui", "center");
  }
}

export function drawLabels(t: number) {
  for (const o of objects) {
    if (o.kind === "pod") {
      if (G.traceOn || o.id === "ledger") {
        drawRounded(o.x - 54, o.y + 60, 108, 31, 7, "#0e1c30e8", "#6a8ba299");
        drawText(
          o.id === "ledger" ? "ledger" : "payment-api",
          o.x,
          o.y + 80,
          "#eaf5ff",
          "11px system-ui",
          "center",
        );
      }
      continue;
    }
    if (o.kind === "edge") continue;
    if (o.kind === "npc") continue;
    drawRounded(o.x - 67, o.y + 48, 134, 39, 8, "#07101dd9", "#4b6887aa");
    drawText(
      o.id === "rhacs" ? "RHACS ALERT" : "OPS TERMINAL",
      o.x,
      o.y + 65,
      "#eff5ff",
      "bold 11px system-ui",
      "center",
    );
    drawText(
      o.id === "rhacs" ? "Inspect anomaly" : "Use oc commands",
      o.x,
      o.y + 79,
      "#9cb1cc",
      "10px system-ui",
      "center",
    );
  }
  if (
    G.near &&
    !G.terminalOpen &&
    !G.detailOpen &&
    !G.radioOpen &&
    !G.caseOpen
  ) {
    const o = G.near;
    ctx.strokeStyle = "#f6ce82";
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.arc(
      o.x,
      o.y,
      Math.min(o.r, 55) + 8 + Math.sin(t * 4) * 2,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }
  if (G.pending && !G.terminalOpen && S.started) {
    glowDot(G.pending.x, G.pending.y, 2.5, "#e4d092");
  }
}

export function draw(t: number) {
  G.frame++;
  const narrow = window.innerWidth <= 520;
  const vw = narrow ? 760 : W;
  if (C.width !== vw) C.width = vw;
  G.cameraX = narrow ? Math.max(0, Math.min(W - vw, S.x - vw / 2)) : 0;
  ctx.setTransform(1, 0, 0, 1, -G.cameraX, 0);
  drawBackground(t);
  drawNode(379, 177, "worker-01");
  drawNode(656, 177, "worker-02");
  if (G.traceOn) drawFlows(t);
  for (const o of objects) {
    if (o.kind === "pod") drawPod(o, t);
    else if (o.kind === "terminal") drawStation(o, t);
    else if (o.kind === "npc") drawNPC(o, t);
  }
  drawAvatar(t);
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
    update(dt);
    draw(t);
  }
  requestAnimationFrame(loop);
}
