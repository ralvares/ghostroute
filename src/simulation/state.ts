import type { ClueId } from "../security/evidence.js";
import { evaluateFindings } from "../security/findings.js";
import type { DomainEvent } from "./events.js";
import { createCluster } from "./cluster-model.js";
import { makeCampaign } from "../campaign/types.js";

import type { SceneId } from "../world/scene-model.js";
export function makeState() {
  return {
    cluster: createCluster(),
    campaign: makeCampaign(),
    world: { scene: "district" as SceneId, visited: ["district"] as SceneId[] },
    story: {
      inventory: [] as string[],
      discoveries: [] as string[],
      notes: "",
      outageSeen: false,
    },
    x: 520,
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
    get env() {
      return "TELEMETRY_ENDPOINT" in this.deployment.env;
    },
    get podRev() {
      return this.deployment.generation;
    },
    get policy(): "none" | "deny" | "allow" {
      return this.policies.has("payment-egress")
        ? "allow"
        : this.policies.has("default-deny-egress")
          ? "deny"
          : "none";
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
}
export let S = makeState();
export type SimulationState = ReturnType<typeof makeState>;
export function replaceState(state: SimulationState) {
  S = state;
}
export function resetState() {
  S = makeState();
}
