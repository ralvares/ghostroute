import {
  initialApplicationNetwork,
  reconcileServices,
} from "../network/services.js";
import type { ClueId } from "../security/evidence.js";
import { evaluateFindings } from "../security/findings.js";
import type { DomainEvent } from "./events.js";
import { buildIncidentResources } from "./incident-resources.js";
import { createCluster } from "./cluster-model.js";
import { makeCampaign } from "../campaign/types.js";

import type { SceneId } from "../world/scene-model.js";
export function makeState() {
  const state = {
    cluster: createCluster(),
    campaign: makeCampaign(),
    incident: {
      auditSeen: false,
      releaseSeen: false,
      accessSeen: false,
      explained: false,
    },
    world: { scene: "district" as SceneId, visited: ["district"] as SceneId[] },
    story: {
      inventory: [] as string[],
      discoveries: [] as string[],
      notes: "",
      outageSeen: false,
      mira: { scene: "cluster" as SceneId, x: 895, y: 465 },
    },
    x: 500,
    y: 410,
    facing: 1,
    step: 0,
    deployment: {
      name: "payment-api",
      namespace: "payments",
      generation: 1,
      env: { TELEMETRY_ENDPOINT: "https://203.0.113.77/upload" } as Record<
        string,
        string
      >,
      readyReplicas: 2,
      desiredReplicas: 2,
    },
    pods: [
      {
        name: "payment-api-7d9cd-ab12",
        node: "worker-01",
        revision: 1,
        ready: true,
      },
      {
        name: "payment-api-7d9cd-cd34",
        node: "worker-02",
        revision: 1,
        ready: true,
      },
    ],
    policies: new Set<"default-deny-egress" | "payment-egress">(),
    incidentNetwork: { dns: true, ledger: true, external: true },
    get env() {
      return "TELEMETRY_ENDPOINT" in this.deployment.env;
    },
    get podRev() {
      return this.deployment.generation;
    },
    get policy(): "none" | "deny" | "allow" {
      return this.incidentNetwork.dns && this.incidentNetwork.ledger
        ? this.incidentNetwork.external
          ? "none"
          : "allow"
        : "deny";
    },
    audit: [] as DomainEvent[],
    findings: evaluateFindings(true, "none"),
    evidence: new Set<ClueId>(),
    checked: new Set<string>(),
    verified: new Set<string>(),
    history: [] as string[],
    commands: 0,
    interruptions: 0,
    traceFound: false,
    seenR: 0,
    started: false,
    done: false,
    firstDeny: false,
    mentorSeen: false,
    patchSeen: false,
    scorePenalty: 0,
    seenIssue: false,
  };
  state.cluster.resources.push(...buildIncidentResources(state));
  state.cluster.resources.push(...initialApplicationNetwork());
  reconcileServices(state.cluster.resources);
  state.cluster.incidentStored = true;
  return state;
}
export let S = makeState();
export type SimulationState = ReturnType<typeof makeState>;
export function replaceState(state: SimulationState) {
  S = state;
}
export function resetState() {
  S = makeState();
}
