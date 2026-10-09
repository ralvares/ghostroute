import { S } from "../simulation/state.js";
import { projectHealth } from "../simulation/health.js";
import { selectedServicePods, serviceBackends } from "../network/services.js";
import { esc } from "./notifications.js";
import type { Resource } from "../simulation/cluster-model.js";

const node = (
  kind: string,
  name: string,
  detail: string,
  state: string,
  status: string,
) =>
  `<div class="topologyNode ${state}"><span class="topologyKind">${esc(kind)}</span><strong title="${esc(name)}">${esc(name)}</strong><small>${esc(detail)}</small><span class="topologyStatus">${esc(status)}</span></div>`;
const ready = (pod: Resource) =>
  !!(pod.status?.containerStatuses as any[])?.length &&
  (pod.status!.containerStatuses as any[]).every((c) => c.ready);
/** A connected graph: only stored Services/Routes and selected ready endpoints form ingress. */
export function paymentApplicationMap() {
  const h = projectHealth(S),
    resources = S.cluster.resources;
  const route = resources.find(
    (r) =>
      r.kind === "Route" &&
      r.metadata.namespace === "payments" &&
      r.metadata.name === "payment-api",
  );
  const service = resources.find(
    (r) =>
      r.kind === "Service" &&
      r.metadata.namespace === "payments" &&
      r.metadata.name === (route?.spec?.to?.name ?? "payment-api"),
  );
  const pods = service ? selectedServicePods(service, resources) : [];
  const count = service
    ? (service.spec?.ports ?? []).reduce(
        (sum: number, p: any) =>
          Math.max(sum, serviceBackends(service, resources, p).length),
        0,
      )
    : 0;
  const dns = h.dnsAllowed ? "allowed" : "blocked",
    ledger = h.ledgerAllowed ? "allowed" : "blocked",
    external = h.externalAllowed
      ? h.externalActive
        ? "active"
        : "open"
      : "blocked";
  return `<div class="applicationTopology" role="group" aria-label="Payment application connectivity"><div class="topologyScope">payments <span>${h.checkout === "HEALTHY" ? "Checkout available" : "Checkout degraded"}</span></div><div class="topologyIngress">${node("Route", route?.metadata.name ?? "payment-api", route?.spec?.tls?.termination ? "TLS " + route.spec.tls.termination : "HTTP", h.ingressAllowed ? "allowed" : "blocked", route ? "Ingress" : "MISSING")}<img class="uiIcon topologyArrow" src="${import.meta.env.BASE_URL}ui/arrow-right.svg" alt="to"/>${node("Service", service?.metadata.name ?? "payment-api", service?.spec?.clusterIP ?? "No Service", count ? "allowed" : "blocked", count + " ready endpoints")}</div><svg class="topologyIngressLink" viewBox="0 0 360 22" role="img" aria-label="${h.ingressAllowed ? "Ingress reaches selected Pods" : "Ingress has no ready backend"}"><path class="flow ${h.ingressAllowed ? "allowed" : "blocked"}" d="M279 0 V11 H180 V22"/></svg><div class="topologyApp">${node("Deployment", "payment-api", h.readyPods + "/" + S.deployment.desiredReplicas + " Pods Ready", h.checkout === "DEGRADED" ? "degraded" : "allowed", h.checkout)}<div class="topologyReplicas">${pods.map((p) => `<span class="${ready(p) ? "allowed" : "blocked"}" title="${esc(p.metadata.name)}"><i></i>${esc(p.spec?.nodeName ?? "Unscheduled")}</span>`).join("") || "<span>No selected Pods</span>"}</div></div><svg class="topologyBranches" viewBox="0 0 360 40" aria-label="Outgoing dependency paths" role="img"><path class="flow ${dns}" d="M180 0 V16 H58 V40"/><path class="flow ${ledger}" d="M180 0 V40"/><path class="flow ${external}" d="M180 0 V16 H302 V40"/></svg><div class="topologyDependencies">${node("Dependency", "DNS", "UDP/TCP 53", dns, dns.toUpperCase())}${node("Dependency", "ledger", "TCP 8443", ledger, ledger.toUpperCase())}${node("External", "203.0.113.77", "TCP 443", external, external.toUpperCase())}</div><p class="mapLegend">Solid: allowed · dashed: blocked · red: unexpected traffic.<br>Pod readiness does not prove the service path works.</p></div>`;
}
export function tenantApplicationMap(
  namespace: string,
  pods: Resource[],
  blocked: boolean,
) {
  const services = S.cluster.resources.filter(
    (r) => r.kind === "Service" && r.metadata.namespace === namespace,
  );
  const links = services
    .map((service) => {
      const selected = selectedServicePods(service, S.cluster.resources),
        count = (service.spec?.ports ?? []).reduce(
          (sum: number, p: any) =>
            Math.max(
              sum,
              serviceBackends(service, S.cluster.resources, p).length,
            ),
          0,
        );
      return `<div class="tenantService">${node(
        "Service",
        service.metadata.name,
        "selector: " +
          Object.entries(service.spec?.selector ?? {})
            .map(([k, v]) => k + "=" + v)
            .join(", "),
        count ? "allowed" : "blocked",
        count + " ready endpoints",
      )}<div class="topologyTrunk ${count ? "allowed" : "blocked"}"></div><div class="tenantSelected">${selected.map((p) => node("Pod", p.metadata.name, p.spec?.nodeName ?? "Unscheduled", ready(p) ? "allowed" : "blocked", ready(p) ? "READY" : String(p.status?.phase ?? "Pending"))).join("") || "<small>No Pods match this selector.</small>"}</div></div>`;
    })
    .join("");
  const unselected = pods.filter(
    (p) =>
      !services.some((s) =>
        selectedServicePods(s, S.cluster.resources).includes(p),
      ),
  );
  return `<div class="applicationTopology tenantTopology"><div class="topologyScope">${esc(namespace)} <span>${pods.filter(ready).length}/${pods.length} Pods Ready</span></div>${links}<div class="tenantWorkloads">${unselected.map((p) => node("Pod", p.metadata.name, p.spec?.nodeName ?? "Unscheduled", ready(p) ? "allowed" : "blocked", ready(p) ? "READY" : String((p.status?.containerStatuses as any[])?.[0]?.state?.waiting?.reason ?? p.status?.phase ?? "Pending"))).join("")}</div>${!pods.length ? "<p>No application deployed in this namespace yet.</p>" : ""}${blocked ? '<p class="topologyIncident">Required client → server path BLOCKED. Pods can remain Ready.</p>' : ""}<p class="mapLegend">Service links follow actual selectors and ready endpoints. Unconnected Pods have no selecting Service.</p></div>`;
}
