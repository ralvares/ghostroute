import { S, resetState } from "./state.js";
import { publish } from "./events.js";
import type { DomainEvent, EventType } from "./events.js";
import type { ClueId } from "../security/evidence.js";
import { kubeRequest, apiBody } from "./kube-api.js";
import { parse } from "yaml";
import { policyFiles } from "./resources.js";
import type { Resource } from "./cluster-model.js";

export function record(
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

/** Compatibility entry points use the same API as terminal mutations. */
export function removeTelemetry() {
  if (!S.env) return false;
  apiBody(kubeRequest({method:"PATCH",path:"/apis/apps/v1/namespaces/payments/deployments/payment-api",contentType:"application/strategic-merge-patch+json",body:{spec:{template:{spec:{containers:[{name:"payment-api",env:[{name:"TELEMETRY_ENDPOINT",$patch:"delete"}]}]}}}}}));
  return true;
}

export function applyPolicy(name: "default-deny-egress" | "payment-egress") {
  const input = parse(policyFiles[name === "payment-egress" ? "policies/payments-egress.yaml" : "policies/deny-all.yaml"]) as Resource;
  apiBody(kubeRequest({method:"PATCH",path:"/apis/networking.k8s.io/v1/namespaces/payments/networkpolicies/"+name,contentType:"application/apply-patch+yaml",body:input}));
}

export function collectEvidence(id: ClueId) {
  if (S.evidence.has(id)) return false;
  S.evidence.add(id);
  record("evidence.collected", { id });
  return true;
}

export function testConnection(destination: "ledger" | "external" | "dns") {
  const allowed = S.pods.some(p => p.ready) && S.incidentNetwork[destination];
  recordConnectionResult(destination, allowed);
  return allowed;
}

/** Credit actual diagnostic results, including single-command exec as well as rsh. */
export function recordConnectionResult(destination: "ledger" | "external" | "dns", allowed: boolean) {
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
}

export function verifyRollout() {
  const complete = S.deployment.desiredReplicas > 0 &&
    S.deployment.readyReplicas === S.deployment.desiredReplicas &&
    S.pods.every((pod) => pod.ready && pod.revision === S.podRev)
  ;
  if (!S.env && complete) S.checked.add("rollout");
  else S.checked.delete("rollout");
  return complete;
}

export function resetSimulation() {
  resetState();
  record("simulation.reset", {}, "simulation");
}
