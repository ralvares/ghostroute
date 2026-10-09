import type { SimulationState } from "./state.js";

/** Policy reachability and Pod readiness are separate signals, not node failures. */
export function projectHealth(state: SimulationState) {
  const dependencyBlocked = !state.incidentNetwork.dns || !state.incidentNetwork.ledger;
  const readyPods = state.pods.filter((pod) => pod.ready).length;
  const externalAllowed = state.incidentNetwork.external;
  return {
    checkout: dependencyBlocked || readyPods < Math.max(1,state.deployment.desiredReplicas) ? "DEGRADED" : "HEALTHY",
    readyPods,
    dnsAllowed: state.incidentNetwork.dns,
    ledgerAllowed: state.incidentNetwork.ledger,
    externalAllowed,
    externalActive: externalAllowed && state.env && readyPods > 0,
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
          ...(state.cluster.incidentStored ? [] : state.pods)
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
          ...(!state.cluster.incidentStored && node.metadata.name === "worker-02"
            ? [{ name: "ledger", namespace: "payments", ready: true }]
            : []),
        ],
      })),
  } as const;
}
