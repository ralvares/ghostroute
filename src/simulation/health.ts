import type { SimulationState } from "./state.js";

/** Policy reachability and Pod readiness are separate signals, not node failures. */
export function projectHealth(state: SimulationState) {
  const dependencyBlocked = state.policy === "deny";
  const readyPods = state.pods.filter((pod) => pod.ready).length;
  const externalAllowed = state.policy === "none";
  return {
    checkout: dependencyBlocked || readyPods < 2 ? "DEGRADED" : "HEALTHY",
    readyPods,
    dnsAllowed: !dependencyBlocked,
    ledgerAllowed: !dependencyBlocked,
    externalAllowed,
    externalActive: externalAllowed && state.env,
    nodes: state.cluster.resources
      .filter((item) => item.kind === "Node")
      .map((node) => ({
        name: node.metadata.name,
        ready:
          Array.isArray(node.status?.conditions) &&
          node.status.conditions.some(
            (condition: { type: string; status: string }) =>
              condition.type === "Ready" && condition.status === "True",
          ),
        pods: [
          ...state.pods
            .filter((pod) => pod.node === node.metadata.name)
            .map((pod) => ({
              name: pod.name,
              namespace: "payments",
              ready: pod.ready,
            })),
          ...state.cluster.resources
            .filter(
              (pod) =>
                pod.kind === "Pod" && pod.spec?.nodeName === node.metadata.name,
            )
            .map((pod) => ({
              name: pod.metadata.name,
              namespace: pod.metadata.namespace,
              ready:
                Array.isArray(pod.status?.containerStatuses) &&
                pod.status.containerStatuses.length > 0 &&
                pod.status.containerStatuses.every(
                  (status: { ready: boolean }) => status.ready,
                ),
            })),
          ...(node.metadata.name === "worker-02"
            ? [{ name: "ledger", namespace: "payments", ready: true }]
            : []),
        ],
      })),
  } as const;
}
