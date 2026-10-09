import type { SimulationState } from "./state.js";
import { serviceBackends } from "../network/services.js";

/** Policy reachability and Pod readiness are separate signals, not node failures. */
export function projectHealth(state: SimulationState) {
  const dependencyBlocked =
    !state.incidentNetwork.dns || !state.incidentNetwork.ledger;
  const readyPods = state.pods.filter((pod) => pod.ready).length;
  const externalAllowed = state.incidentNetwork.external;
  const route = state.cluster.resources.find(
    (r) =>
      r.kind === "Route" &&
      r.metadata.namespace === "payments" &&
      r.metadata.name === "payment-api",
  );
  const service = state.cluster.resources.find(
    (r) =>
      r.kind === "Service" &&
      r.metadata.namespace === "payments" &&
      r.metadata.name === route?.spec?.to?.name,
  );
  const port =
    service?.spec?.ports?.find(
      (p: any) =>
        p.name === route?.spec?.port?.targetPort ||
        p.port === route?.spec?.port?.targetPort,
    ) ?? (!route?.spec?.port ? service?.spec?.ports?.[0] : undefined);
  const ingressAllowed =
    !!route &&
    !!service &&
    !!port &&
    (route.status?.ingress as any[])?.some((i) =>
      i.conditions?.some(
        (c: any) => c.type === "Admitted" && c.status === "True",
      ),
    ) &&
    serviceBackends(service, state.cluster.resources, port).length > 0;
  return {
    checkout:
      dependencyBlocked ||
      !ingressAllowed ||
      readyPods < Math.max(1, state.deployment.desiredReplicas)
        ? "DEGRADED"
        : "HEALTHY",
    ingressAllowed: !!ingressAllowed,
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
          ...(!state.cluster.incidentStored &&
          node.metadata.name === "worker-02"
            ? [{ name: "ledger", namespace: "payments", ready: true }]
            : []),
        ],
      })),
  } as const;
}
