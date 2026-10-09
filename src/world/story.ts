import type { SimulationState } from "../simulation/state.js";
export const discoveryNames: Record<string, string> = {
  keycard: "Maintenance keycard",
  "admin-key": "Sealed cluster administrator key",
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
  if (id === "admin-key") {
    state.story.inventory.push("admin-access-key");
    state.cluster.files["credentials/platform-admin.txt"] = "Sealed emergency credential · prod-east\nUsername: platform-admin\nPassword: training-admin-7f2b9a64c183\nLogin: oc login -u platform-admin -p training-admin-7f2b9a64c183\nUse least privilege. This identity is bound to cluster-admin. All changes are audited.\n";
  }
  return true;
}

export function canEnterWorker(state: SimulationState) {
  return state.story.inventory.includes("worker-pass");
}
