import { G } from "../game/runtime.js";
import { S } from "../simulation/state.js";
import { $ } from "../ui/dom.js";
import { currentChapter } from "../campaign/engine.js";
import { pathCompletions } from "./path-completion.js";

export const cmdCandidates = [
  "case status",
  "case explain release-import",
  "case hint",
  "case next",
  "game status",
  "game save",
  "game export",
  "game import",
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
  "cd workloads",
  "cd ..",
  "cd ~",
  "ls -la",
  "cat README.md",
  "mkdir investigation",
  "less audit/kube-apiserver.log",
  "jq 'select(.verb == \"patch\") | {user: .user.username, time: .requestReceivedTimestamp, request: .requestObject}' audit/kube-apiserver.log",
  "cat audit/kube-apiserver.log | more",
  "man jq",
  "history",
  "which jq less oc",
  "ls",
  "ls policies",
  "cat policies/deny-all.yaml",
  "cat policies/payments-egress.yaml",
  "oc --help",
  "cat lab.txt",
  "ls workloads",
  "ls scc",
  "oc create namespace lab",
  "oc create configmap settings --from-literal=owner=mira --dry-run=client -o yaml",
  "oc create secret generic training --from-literal=password=training --dry-run=server",
  "oc patch configmap settings --type=merge -p '{\"data\":{\"owner\":\"kai\"}}'",
  "oc replace -f settings.json",
  "oc label configmap settings owner=mira --overwrite",
  "oc annotate configmap settings case=incident-18",
  "oc project lab",
  "oc apply -f workloads/owned-root.yaml",
  "oc apply -f workloads/owned-secure.yaml",
  "oc create serviceaccount vendor",
  "oc apply -f workloads/vendor.yaml",
  "oc get events",
  "oc get scc -o yaml",
  "oc login -u platform-admin -p training",
  "oc adm policy add-scc-to-user anyuid -z vendor",
  "oc apply -f scc/vendor-fixed-uid.yaml",
  "oc adm policy add-scc-to-user vendor-fixed-uid -z vendor",
  "cat audit/kube-apiserver.log | jq 'select(.responseStatus.code == 403)'",
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
  return G.podShell
    ? podCandidates
    : [
        ...cmdCandidates,
        ...currentChapter().probes.map((p) => "case test " + p.id),
        "case conclude " + currentChapter().conclusion,
      ];
}

export function matchSuggestion(v: string) {
  if (!v.trim()) return "";
  if (!G.podShell) {
    const paths = pathCompletions(v);
    if (paths !== null) return paths[0] ?? "";
  }
  const all = [...S.history.slice().reverse(), ...candidates()];
  return all.find((a) => a.startsWith(v) && a !== v) || "";
}

export function completionMatches(v: string, cursor = v.length) {
  if (!G.podShell) {
    const paths = pathCompletions(v, cursor);
    if (paths !== null) return paths;
  }
  return [...new Set([...S.history.slice().reverse(), ...candidates()])].filter(
    (c) => c.startsWith(v) && c !== v,
  );
}

export function suggest() {
  let v = $("termInput").value,
    m = matchSuggestion(v),
    remaining = m ? m.slice(v.length) : "";
  $("ghostLead").textContent = v;
  $("ghostLead").style.visibility = "hidden";
  $("ghostTail").textContent = remaining;
}
