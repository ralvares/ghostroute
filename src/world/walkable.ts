import type { SceneId } from "./scene-model.js";
type Point = { x: number; y: number };
// Convex walkable floors prevent characters crossing walls or floating over the city.
const district: number[][] = [
  [90, 325],
  [370, 195],
  [865, 290],
  [1110, 395],
  [950, 585],
  [390, 610],
  [95, 440],
];
const lobby: number[][] = [
  [100, 325],
  [380, 215],
  [845, 260],
  [1100, 410],
  [950, 600],
  [170, 590],
  [100, 510],
];
const room: number[][] = [
  [120, 340],
  [455, 210],
  [875, 230],
  [1090, 385],
  [850, 590],
  [340, 590],
  [145, 510],
];
const zones: Record<SceneId, number[][]> = {
  district,
  cluster: lobby,
  "worker-01": room,
  "worker-02": room,
  soc: room,
  external: district,
  operations: room,
  archive: room,
};
export function onFloor(point: Point, scene: SceneId): boolean {
  const polygon = zones[scene];
  let sign = 0;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i],
      b = polygon[(i + 1) % polygon.length];
    const cross =
      (b[0] - a[0]) * (point.y - a[1]) - (b[1] - a[1]) * (point.x - a[0]);
    if (Math.abs(cross) < 0.001) continue;
    if (sign && Math.sign(cross) !== sign) return false;
    sign = Math.sign(cross);
  }
  return true;
}
export function floorPoint(point: Point, scene: SceneId): Point {
  if (onFloor(point, scene)) return point;
  let nearest = { x: 570, y: 490 },
    distance = Infinity;
  const polygon = zones[scene];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i],
      b = polygon[(i + 1) % polygon.length];
    const dx = b[0] - a[0],
      dy = b[1] - a[1];
    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - a[0]) * dx + (point.y - a[1]) * dy) / (dx * dx + dy * dy),
      ),
    );
    const candidate = { x: a[0] + t * dx, y: a[1] + t * dy };
    const d = Math.hypot(point.x - candidate.x, point.y - candidate.y);
    if (d < distance) {
      nearest = candidate;
      distance = d;
    }
  }
  return nearest;
}
