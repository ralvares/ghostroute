import type { WorldObject } from "./locations.js";
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface LabelRequest {
  object: WorldObject;
  width: number;
  height: number;
  compactHeight: number;
  compactWidth?: number;
}
export interface PlacedLabel extends Rect {
  object: WorldObject;
  compact: boolean;
}
export function overlaps(a: Rect, b: Rect, gap = 6) {
  return (
    a.x < b.x + b.width + gap &&
    a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap &&
    a.y + a.height + gap > b.y
  );
}
/** Place anchored labels around visible objects; never cover actors or another label. */
export function placeWorldLabels(
  requests: LabelRequest[],
  viewport: Rect,
  blockers: Rect[],
): PlacedLabel[] {
  const placed: PlacedLabel[] = [];
  for (const request of requests) {
    const o = request.object;
    if (
      o.x < viewport.x - 30 ||
      o.x > viewport.x + viewport.width + 30 ||
      o.y < viewport.y ||
      o.y > viewport.y + viewport.height
    )
      continue;
    for (const compact of [false, true]) {
      const h = compact ? request.compactHeight : request.height,
        w = compact ? (request.compactWidth ?? request.width) : request.width;
      const positions = [
        [o.x - w / 2, o.y + 34],
        [o.x - w / 2, o.y + 86],
        [o.x + 65, o.y + 30],
        [o.x - w - 65, o.y + 30],
        [o.x - w / 2, o.y - 145 - h],
        [o.x - w / 2, o.y + 140],
      ];
      let found = false;
      for (const [x, y] of positions) {
        const rect = {
          x: Math.max(
            viewport.x + 10,
            Math.min(viewport.x + viewport.width - w - 10, x),
          ),
          y,
          width: w,
          height: h,
        };
        if (y < viewport.y + 10 || y + h > viewport.y + viewport.height - 10)
          continue;
        if ([...blockers, ...placed].some((b) => overlaps(rect, b))) continue;
        placed.push({ ...rect, object: o, compact });
        found = true;
        break;
      }
      if (found) break;
    }
  }
  return placed;
}
