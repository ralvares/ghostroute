import type { SimulationState } from "../simulation/state.js";
export const discoveryNames: Record<string, string> = {
  keycard: "Maintenance keycard",
  access: "Worker investigation pass",
  audit: "Build-bot audit trail",
  release: "Telemetry release record",
  image: "Arbitrary UID build notes",
  boundary: "Dependency diagram",
};
export function canEnterArchive(state: SimulationState) {
  return state.story.inventory.includes("maintenance-keycard");
}
export function discover(state: SimulationState, id: string) {
  if (state.story.discoveries.includes(id)) return false;
  state.story.discoveries.push(id);
  if (id === "access") state.story.inventory.push("worker-pass");
  if (id === "keycard") state.story.inventory.push("maintenance-keycard");
  return true;
}

export function canEnterWorker(state: SimulationState) {
  return state.story.inventory.includes("worker-pass");
}
