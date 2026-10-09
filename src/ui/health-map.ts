import {
  paymentApplicationMap,
  tenantApplicationMap,
} from "./application-map.js";
import { campaignHealth } from "../campaign/continuity.js";
import { S } from "../simulation/state.js";
import { projectHealth } from "../simulation/health.js";
import { esc } from "./notifications.js";
import { currentChapter, campaignChecks } from "../campaign/engine.js";
let view = "application";
let signature = "";
const el = (id: string) => document.getElementById(id)!;
export function updateHealthMap() {
  const health = projectHealth(S);
  if (S.campaign.active) {
    const ch = currentChapter(),
      { pods, ready, blocked, degraded: tenantDegraded } = campaignHealth();
    const degraded = tenantDegraded || health.checkout === "DEGRADED";
    const state = degraded
      ? "DEGRADED"
      : pods.length
        ? "RUNNING"
        : "INVESTIGATING";
    const checklist = campaignChecks(),
      met = checklist.filter((g) => g.passed).length;
    el("impactFlag").hidden = !degraded;
    el("impactFlag").textContent =
      health.checkout === "DEGRADED"
        ? "PAYMENTS CHECKOUT DEGRADED · earlier service boundary broken"
        : blocked
          ? "APPLICATION DEGRADED · intended service path blocked · Pods remain Ready"
          : "WORKLOAD DEGRADED · " +
            ready +
            "/" +
            pods.length +
            " tenant Pods Ready";
    el("health").textContent = S.campaign.finished ? health.checkout : state;
    el("health").className = degraded ? "bad" : "good";
    el("healthDetail").textContent = pods.length
      ? ready + "/" + pods.length + " tenant Pods Ready"
      : S.campaign.finished
        ? `${health.readyPods} / ${S.deployment.desiredReplicas} payment Pods Ready`
        : "No workload in this assessment";
    el("healthSummary").textContent = S.campaign.finished
      ? "HANDOVER VERIFIED · prod-east"
      : state + " · prod-east / " + ch.namespace;
    el("healthSummary").className = degraded ? "bad" : "good";
    el("bastionHealth").textContent =
      ch.title +
      " · " +
      state +
      " · " +
      met +
      "/" +
      checklist.length +
      " case objectives · payments " +
      health.checkout.toLowerCase();
    if (view === "application") {
      el("healthMap").innerHTML = tenantApplicationMap(
        ch.namespace,
        pods,
        blocked,
      );
    } else
      el("healthMap").innerHTML =
        `<div class="nodeMap">${health.nodes.map((node) => `<div class="nodeTile ${S.world.scene === node.name ? "here" : ""}"><strong>${esc(node.name)}</strong><span class="${node.ready ? "good" : "bad"}">${node.ready ? "READY" : "NOT READY"}</span><small>${node.pods.length} Pods</small><div class="podDots">${node.pods.map((p) => `<i class="${p.ready ? "ready" : "notReady"}" role="img" aria-label="${esc(p.namespace)}/${esc(p.name)}: ${p.ready ? "Ready" : "Not Ready"}" title="${esc(p.namespace)}/${esc(p.name)}: ${p.ready ? "Ready" : "Not Ready"}"></i>`).join("")}</div></div>`).join("")}</div><p class="mapLegend">Node readiness and tenant workload health are separate.</p>`;
    el("healthMap").dataset.view = view;
    el("healthMap").dataset.health = state.toLowerCase();
    signature = "";
    return;
  }
  el("impactFlag").hidden = health.checkout !== "DEGRADED";
  el("impactFlag").textContent =
    S.policy === "deny"
      ? `CHECKOUT DEGRADED · ${[!health.dnsAllowed ? "DNS" : "", !health.ledgerAllowed ? "ledger" : ""].filter(Boolean).join(" + ")} blocked`
      : !health.ingressAllowed
        ? "CHECKOUT DEGRADED · route or Service has no ready backend"
        : "CHECKOUT DEGRADED · required replicas unavailable";
  const bastion = document.getElementById("bastionHealth");
  if (bastion) {
    bastion.textContent = `Checkout ${health.checkout.toLowerCase()} · ${health.readyPods}/${S.deployment.desiredReplicas} Pods Ready · DNS ${health.dnsAllowed ? "allowed" : "blocked"} · ledger ${health.ledgerAllowed ? "allowed" : "blocked"}`;
    bastion.className =
      health.checkout === "DEGRADED"
        ? "bastionHealth bad"
        : "bastionHealth good";
  }
  el("healthSummary").textContent =
    `${health.checkout} · ${health.readyPods}/${S.deployment.desiredReplicas} payment Pods ready`;
  el("healthSummary").className =
    health.checkout === "DEGRADED" ? "bad" : "good";
  const next = JSON.stringify([
    view,
    health,
    S.world.scene,
    S.cluster.resources.filter((r) =>
      ["Route", "Service", "Deployment", "Pod"].includes(r.kind),
    ),
  ]);
  if (next === signature) return;
  signature = next;
  el("healthMap").dataset.health = health.checkout.toLowerCase();
  el("healthMap").dataset.view = view;
  if (view === "cluster") {
    el("healthMap").innerHTML =
      `<div class="nodeMap">${health.nodes.map((node) => `<div class="nodeTile ${S.world.scene === node.name ? "here" : ""}"><strong>${esc(node.name)}</strong><span class="${node.ready ? "good" : "bad"}">${node.ready ? "READY" : "NOT READY"}</span><small>${node.pods.length} Pods${node.name === "control-01" ? " · control plane" : ""}</small><div class="podDots">${node.pods.map((pod) => `<i class="${pod.ready ? "ready" : "notReady"}" role="img" aria-label="${esc(pod.namespace)}/${esc(pod.name)}: ${pod.ready ? "Ready" : "Not Ready"}" title="${esc(pod.namespace)}/${esc(pod.name)}: ${pod.ready ? "Ready" : "Not Ready"}"></i>`).join("")}</div></div>`).join("")}</div><p class="mapLegend">${health.nodes.filter((node) => node.ready).length}/${health.nodes.length} nodes Ready · ${health.checkout === "DEGRADED" ? "Application impact below" : "No checkout impact"}</p>`;
  } else {
    el("healthMap").innerHTML = paymentApplicationMap();
  }
}
export function registerHealthMap() {
  document
    .querySelectorAll<HTMLButtonElement>("[data-health-view]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        view = button.dataset.healthView!;
        document.querySelectorAll("[data-health-view]").forEach((tab) => {
          tab.setAttribute("aria-pressed", String(tab === button));
          tab.classList.toggle("selected", tab === button);
        });
        updateHealthMap();
      }),
    );
  updateHealthMap();
}
