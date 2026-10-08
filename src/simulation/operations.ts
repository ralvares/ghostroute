import { S, resetState } from "./state.js";
import { publish } from "./events.js";
import type { DomainEvent, EventType } from "./events.js";
import { evaluateFindings } from "../security/findings.js";
import type { ClueId } from "../security/evidence.js";

function record(
  type: EventType,
  data: DomainEvent["data"],
  actor: DomainEvent["actor"] = "operator",
) {
  const sequence = S.audit.length + 1;
  const event: DomainEvent = Object.freeze({
    sequence,
    type,
    actor,
    data: Object.freeze({ ...data }),
    at: new Date(
      Date.UTC(2026, 9, 8, 2, 14, 0) + sequence * 1000,
    ).toISOString(),
  });
  S.audit.push(event);
  publish(event);
}

function reevaluate() {
  S.findings = evaluateFindings(S.env, S.policy);
  record("security.reevaluated", { ...S.findings }, "simulation");
}

/** The offline rollout finishes synchronously with two replacement Ready Pods. */
export function removeTelemetry() {
  if (!S.env) return false;
  delete S.deployment.env.TELEMETRY_ENDPOINT;
  S.deployment.generation++;
  S.patchSeen = true;
  S.checked.clear();
  record("deployment.updated", {
    name: S.deployment.name,
    generation: S.podRev,
    removed: "TELEMETRY_ENDPOINT",
  });
  S.pods = S.pods.map((pod, index) => ({
    ...pod,
    revision: S.podRev,
    name: `payment-api-8dc11-${index === 0 ? "ab12" : "cd34"}`,
    ready: true,
  }));
  record(
    "pods.replaced",
    { count: S.pods.length, revision: S.podRev },
    "simulation",
  );
  record(
    "rollout.completed",
    { generation: S.podRev, readyReplicas: S.deployment.readyReplicas },
    "simulation",
  );
  reevaluate();
  return true;
}

/** Kubernetes egress permissions are the union of selecting policies. */
export function applyPolicy(name: "default-deny-egress" | "payment-egress") {
  const previous = S.policy;
  const hadOutage = S.firstDeny;
  S.policies.add(name);
  if (previous !== S.policy) {
    S.checked.delete("positive");
    S.checked.delete("negative");
  }
  if (S.policy === "deny" && !S.firstDeny) {
    S.firstDeny = true;
    S.interruptions++;
  }
  record("policy.applied", {
    name,
    effectiveEgress: S.policy,
    outageStarted: !hadOutage && S.firstDeny,
  });
  reevaluate();
}

export function collectEvidence(id: ClueId) {
  if (S.evidence.has(id)) return false;
  S.evidence.add(id);
  record("evidence.collected", { id });
  return true;
}

export function testConnection(destination: "ledger" | "external" | "dns") {
  const allowed =
    destination === "external" ? S.policy === "none" : S.policy !== "deny";
  const check =
    destination === "ledger"
      ? "positive"
      : destination === "external"
        ? "negative"
        : null;
  if (check) {
    const passed = destination === "external" ? !allowed : allowed;
    if (passed) S.checked.add(check);
    else S.checked.delete(check);
  }
  record("connectivity.tested", { destination, allowed });
  return allowed;
}

export function verifyRollout() {
  if (!S.env) S.checked.add("rollout");
  return (
    S.deployment.readyReplicas === S.pods.length &&
    S.pods.every((pod) => pod.ready && pod.revision === S.podRev)
  );
}

export function resetSimulation() {
  resetState();
  record("simulation.reset", {}, "simulation");
}
