import { S } from "../simulation/state.js";
import { chapters } from "./catalog.js";
import { flow } from "./models.js";

/** The entire journey shares one API state; district names are business areas. */
export const campaignCluster = "prod-east";
export function campaignHealth() {
  const ch = chapters[S.campaign.active];
  const pods = S.cluster.resources.filter(
    (p) => p.kind === "Pod" && p.metadata.namespace === ch.namespace,
  );
  const ready = pods.filter((p) =>
    (p.status?.containerStatuses as { ready: boolean }[] | undefined)?.every(
      (c) => c.ready,
    ),
  ).length;
  const servicePath = ch.probes.some((p) =>
    ["client-flow", "udn-local"].includes(p.model),
  );
  const blocked =
    servicePath &&
    pods.some((p) => p.metadata.name === "client") &&
    pods.some((p) => p.metadata.name === "server") &&
    !flow(ch.namespace, "client", "server");
  const degraded = pods.length > ready || blocked;
  return {
    pods,
    ready,
    blocked,
    degraded,
    state: degraded ? "DEGRADED" : pods.length ? "RUNNING" : "INVESTIGATING",
  };
}
