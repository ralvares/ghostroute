import type { Resource } from "./cluster-model.js";
import { S, type SimulationState } from "./state.js";
import { matchesLabels, networkPolicyDirection } from "../security/network-policy.js";
import { evaluateFindings } from "../security/findings.js";
import { record } from "./operations.js";

/** The world is a projection of stored incident resources, never an alternative API. */
export function projectIncident(state: SimulationState = S, emit = true) {
  const resources = state.cluster.resources;
  const deployment = resources.find(r => r.kind === "Deployment" && r.metadata.namespace === "payments" && r.metadata.name === "payment-api");
  const previousGeneration = state.deployment.generation;
  const telemetryBefore = state.env;
  const networkBefore = JSON.stringify(state.incidentNetwork);
  const podsBefore = state.pods.map(p => p.name).join("/");
  const podResources = deployment ? resources.filter(r => r.kind === "Pod" && r.metadata.namespace === "payments" && matchesLabels(r.metadata.labels, deployment.spec?.selector)) : [];
  const container = deployment?.spec?.template?.spec.containers.find(c => c.name === "payment-api");
  state.deployment.env = Object.fromEntries((container?.env ?? []).map(e => [e.name, e.value ?? "<valueFrom>"]));
  state.deployment.generation = deployment?.metadata.generation ?? previousGeneration;
  state.deployment.desiredReplicas = deployment ? deployment.spec?.replicas ?? 1 : 0;
  state.pods = podResources.map(p => ({name:p.metadata.name,node:p.spec?.nodeName ?? "",revision:state.podRev,
    ready: Array.isArray(p.status?.containerStatuses) && p.status.containerStatuses.length > 0 && p.status.containerStatuses.every((c: any) => c.ready)}));
  state.deployment.readyReplicas = state.pods.filter(p => p.ready).length;
  // These are the application endpoints recorded for the incident. DNS is a
  // daemonset endpoint; its individual system Pods are outside this scene fixture.
  const source = podResources[0] ?? {apiVersion:"v1",kind:"Pod",metadata:{name:"payment-api",namespace:"payments",labels:container ? deployment?.spec?.template?.metadata?.labels : {app:"payment-api"}}} as Resource;
  const ledger = resources.find(r => r.kind === "Pod" && r.metadata.namespace === "payments" && r.metadata.labels?.app === "ledger");
  const dns: Resource = {apiVersion:"v1",kind:"Pod",metadata:{name:"dns-endpoint",namespace:"openshift-dns",labels:{"dns.operator.openshift.io/daemonset-dns":"default"}}};
  state.incidentNetwork = {
    dns: networkPolicyDirection(resources, source, dns, "egress", 53, "UDP") !== false && networkPolicyDirection(resources, dns, source, "ingress", 53, "UDP") !== false,
    ledger: !!ledger && ledger.status?.phase === "Running" &&
      (ledger.status?.containerStatuses as {ready: boolean}[] | undefined)?.some(c => c.ready) === true &&
      networkPolicyDirection(resources, source, ledger, "egress", 8443) !== false &&
      networkPolicyDirection(resources, ledger, source, "ingress", 8443) !== false,
    external: networkPolicyDirection(resources, source, undefined, "egress", 443, "TCP", "203.0.113.77") !== false,
  };
  state.policies = new Set(resources.filter(r => r.kind === "NetworkPolicy" && r.metadata.namespace === "payments" && ["default-deny-egress","payment-egress"].includes(r.metadata.name)).map(r => r.metadata.name as "default-deny-egress" | "payment-egress"));
  const changed = previousGeneration !== state.podRev || telemetryBefore !== state.env;
  const networkChanged = networkBefore !== JSON.stringify(state.incidentNetwork);
  state.findings = {...evaluateFindings(state.env, state.policy),baselineDeviation:state.env && state.incidentNetwork.external && state.deployment.readyReplicas > 0,unrestrictedEgress:state.incidentNetwork.external,dependencyUnavailable:!state.incidentNetwork.dns || !state.incidentNetwork.ledger};
  if (!emit) return;
  if (changed) {
    state.checked.clear();
    if (telemetryBefore && !state.env) state.patchSeen = true;
    record("deployment.updated", {name:"payment-api",generation:state.podRev,removed:telemetryBefore && !state.env ? "TELEMETRY_ENDPOINT" : ""});
  }
  if (podsBefore !== state.pods.map(p => p.name).join("/")) record("pods.replaced", {count:state.pods.length,revision:state.podRev}, "simulation");
  if (changed) record("rollout.completed", {generation:state.podRev,readyReplicas:state.deployment.readyReplicas}, "simulation");
  if (networkChanged) {
    state.checked.delete("positive");state.checked.delete("negative");
    const outageStarted = state.policy === "deny" && !state.firstDeny;
    if (outageStarted) {state.firstDeny=true;state.interruptions++;}
    record("policy.applied", {name:"payments egress",effectiveEgress:state.policy,outageStarted});
  }
  if (changed || networkChanged) record("security.reevaluated", {...state.findings}, "simulation");
}
