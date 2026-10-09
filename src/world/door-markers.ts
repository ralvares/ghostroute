/** The prompt uses the same 100-world-unit range as keyboard interaction. */
export function doorMarkerState(distance: number, objective = false) {
  return distance < 100
    ? "on-ring"
    : objective
      ? "objective"
      : distance < 190
        ? "in-range"
        : "far";
}
