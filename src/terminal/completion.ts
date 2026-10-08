import { G } from "../game/runtime.js";
import { S } from "../simulation/state.js";
import { $ } from "../ui/dom.js";

export const cmdCandidates = [
  "help",
  "oc whoami",
  "oc get nodes",
  "oc get namespaces",
  "oc get pods -n payments -o wide",
  "oc get deployment payment-api -n payments -o yaml",
  "oc logs deployment/payment-api -n payments --tail=25",
  "oc get networkpolicies -n payments",
  "oc describe deployment payment-api -n payments",
  "oc auth can-i patch deployments -n payments",
  "oc rsh -n payments deployment/payment-api",
  "oc set env deployment/payment-api -n payments TELEMETRY_ENDPOINT-",
  "oc rollout status deployment/payment-api -n payments",
  "oc apply -f policies/deny-all.yaml",
  "oc apply -f policies/payments-egress.yaml",
  "oc get networkpolicy payment-egress -n payments -o yaml",
  "pwd",
  "ls",
  "ls policies",
  "cat policies/deny-all.yaml",
  "cat policies/payments-egress.yaml",
  "clear",
  "exit",
];

export const podCandidates = [
  "help",
  "env",
  "ip route",
  "nslookup ledger.payments.svc.cluster.local",
  "curl -I https://ledger.payments.svc.cluster.local:8443/health",
  "curl -I https://203.0.113.77",
  "curl -v https://203.0.113.77/upload",
  "exit",
  "clear",
];

export function candidates() {
  return G.podShell ? podCandidates : cmdCandidates;
}

export function matchSuggestion(v: string) {
  if (!v.trim()) return "";
  const all = [...S.history.slice().reverse(), ...candidates()];
  return all.find((a) => a.startsWith(v) && a !== v) || "";
}

export function suggest() {
  let v = $("termInput").value,
    m = matchSuggestion(v),
    remaining = m ? m.slice(v.length) : "";
  $("ghostLead").textContent = v;
  $("ghostLead").style.visibility = "hidden";
  $("ghostTail").textContent = remaining;
}
