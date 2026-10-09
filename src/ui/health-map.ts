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
      el("healthMap").innerHTML =
        `<div class="chapterHealth"><div class="healthMetrics"><span><b>${ready}/${pods.length}</b> Pods Ready</span><span class="${degraded ? "bad" : "good"}"><b>${blocked ? "Blocked" : ready < pods.length ? "Pending" : "Available"}</b> service path</span></div><div class="healthWorkloads">${pods
          .slice(0, 3)
          .map((p) => {
            const statuses = p.status?.containerStatuses as
              { ready: boolean }[] | undefined;
            const isReady =
              !!statuses?.length && statuses.every((c) => c.ready);
            return `<div><span class="${isReady ? "good" : "bad"}">${isReady ? "Ready" : esc(String(p.status?.phase ?? "Pending"))}</span><span title="${esc(p.metadata.name)}">${esc(p.metadata.name)}</span></div>`;
          })
          .join(
            "",
          )}${pods.length > 3 ? `<small>+ ${pods.length - 3} more Pods · inspect from the bastion</small>` : !pods.length ? `<p>No workload deployed in ${esc(ch.namespace)}.</p>` : ""}</div></div><p class="mapLegend">${degraded ? "Check workload readiness and the blocked service path." : "Pod readiness and application connectivity are separate checks."}</p>`;
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
  const next = JSON.stringify([view, health, S.world.scene]);
  if (next === signature) return;
  signature = next;
  el("healthMap").dataset.health = health.checkout.toLowerCase();
  el("healthMap").dataset.view = view;
  if (view === "cluster") {
    el("healthMap").innerHTML =
      `<div class="nodeMap">${health.nodes.map((node) => `<div class="nodeTile ${S.world.scene === node.name ? "here" : ""}"><strong>${esc(node.name)}</strong><span class="${node.ready ? "good" : "bad"}">${node.ready ? "READY" : "NOT READY"}</span><small>${node.pods.length} Pods${node.name === "control-01" ? " · control plane" : ""}</small><div class="podDots">${node.pods.map((pod) => `<i class="${pod.ready ? "ready" : "notReady"}" role="img" aria-label="${esc(pod.namespace)}/${esc(pod.name)}: ${pod.ready ? "Ready" : "Not Ready"}" title="${esc(pod.namespace)}/${esc(pod.name)}: ${pod.ready ? "Ready" : "Not Ready"}"></i>`).join("")}</div></div>`).join("")}</div><p class="mapLegend">${health.nodes.filter((node) => node.ready).length}/${health.nodes.length} nodes Ready · ${health.checkout === "DEGRADED" ? "Application impact below" : "No checkout impact"}</p>`;
  } else {
    const dependency = health.dnsAllowed ? "allowed" : "blocked";
    const ledger = health.ledgerAllowed ? "allowed" : "blocked";
    const external = health.externalAllowed
      ? health.externalActive
        ? "active"
        : "open"
      : "blocked";
    el("healthMap").innerHTML =
      `<svg viewBox="0 0 350 126" role="img" aria-label="Payment application: ${health.readyPods} Pods Ready. DNS ${dependency}, ledger ${ledger}, external ${external}."><path class="flow ${dependency}" d="M126 8 L166 8"/><path class="flow ${ledger}" d="M126 52 L166 52"/><path class="flow ${external}" d="M126 96 L166 96"/><rect class="appNode ${health.checkout === "DEGRADED" ? "degraded" : ""}" x="0" y="24" width="126" height="56" rx="7"/><text class="appLabel" x="12" y="44">payment-api</text><text class="subText" x="12" y="64">${health.readyPods}/${S.deployment.desiredReplicas} Pods Ready</text><text x="176" y="7">DNS</text><text class="subText ${dependency}" x="176" y="22">${dependency.toUpperCase()}</text><text x="176" y="51">ledger :8443</text><text class="subText ${ledger}" x="176" y="66">${ledger.toUpperCase()}</text><text x="176" y="95">External</text><text class="subText ${external}" x="176" y="110">${external.toUpperCase()}${external === "active" ? " · UNCONTROLLED" : ""}</text></svg><p class="mapLegend">${health.checkout === "DEGRADED" ? "Inspect readiness and each dependency path to restore checkout." : "Solid line: dependency reachable · dashed: blocked"}</p>`;
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
