import { S } from "./state.js";
import { simulationEpoch } from "./resource-table.js";
/** Request order plus explicit virtual time; no wall-clock dependency in saves. */
export const emulatorTime = () =>
  simulationEpoch + S.cluster.audit.length * 1000 + S.cluster.clockOffsetMs;
export function advanceEmulatorTime(milliseconds: number) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0)
    throw new Error("invalid virtual duration");
  S.cluster.clockOffsetMs += milliseconds;
}
