import { S } from "../simulation/state.js";
import { projectHealth } from "../simulation/health.js";
import { esc } from "./notifications.js";
let view = "application";
let signature = "";
const el = (id: string) => document.getElementById(id)!;
export function updateHealthMap() {
  const health = projectHealth(S);
  el("impactFlag").hidden = health.checkout !== "DEGRADED";
  el("impactFlag").textContent =
    S.policy === "deny"
      ? "CHECKOUT DEGRADED · DNS + ledger blocked"
      : "CHECKOUT DEGRADED · required replicas unavailable";
  const bastion = document.getElementById("bastionHealth");
  if (bastion) {
    bastion.textContent = `Checkout ${health.checkout.toLowerCase()} · ${health.readyPods}/2 Pods Ready · DNS ${health.dnsAllowed ? "allowed" : "blocked"} · ledger ${health.ledgerAllowed ? "allowed" : "blocked"}`;
    bastion.className =
      health.checkout === "DEGRADED"
        ? "bastionHealth bad"
        : "bastionHealth good";
  }
  el("healthSummary").textContent =
    `${health.checkout} · ${health.readyPods}/2 payment Pods ready`;
  el("healthSummary").className =
    health.checkout === "DEGRADED" ? "bad" : "good";
  const next = JSON.stringify([view, health, S.world.scene]);
  if (next === signature) return;
  signature = next;
  el("healthMap").dataset.health = health.checkout.toLowerCase();
  el("healthMap").dataset.view = view;
  if (view === "cluster") {
    el("healthMap").innerHTML =
      `<div class="nodeMap">${health.nodes.map((node) => `<div class="nodeTile ${S.world.scene === node.name ? "here" : ""}"><strong>${esc(node.name)}</strong><span class="${node.ready ? "good" : "bad"}">${node.ready ? "READY" : "NOT READY"}</span><small>${node.pods.length} Pods${node.name.startsWith("master") ? " · control plane" : ""}</small><div class="podDots">${node.pods.map((pod) => `<i class="${pod.ready ? "ready" : "notReady"}" title="${esc(pod.namespace)}/${esc(pod.name)}"></i>`).join("")}</div></div>`).join("")}</div><p class="mapLegend">${health.nodes.filter((node) => node.ready).length}/${health.nodes.length} nodes Ready · ${health.checkout === "DEGRADED" ? "Application impact below" : "No checkout impact"}</p>`;
  } else {
    const dependency = health.dnsAllowed ? "allowed" : "blocked";
    const external = health.externalAllowed
      ? health.externalActive
        ? "active"
        : "open"
      : "blocked";
    el("healthMap").innerHTML =
      `<svg viewBox="0 0 350 126" role="img" aria-label="Payment application: ${health.readyPods} Pods Ready. DNS ${dependency}, ledger ${dependency}, external ${external}."><path class="flow ${dependency}" d="M160 48 L230 24 M160 48 L230 76"/><path class="flow ${external}" d="M100 63 L100 108 L230 108"/><rect class="appNode ${health.checkout === "DEGRADED" ? "degraded" : ""}" x="8" y="22" width="152" height="56" rx="5"/><text x="20" y="42">payment-api</text><text class="subText" x="20" y="61">${health.readyPods}/2 Pods Ready</text><text x="238" y="22">DNS</text><text class="subText ${dependency}" x="238" y="38">${dependency.toUpperCase()}</text><text x="238" y="72">ledger :8443</text><text class="subText ${dependency}" x="238" y="88">${dependency.toUpperCase()}</text><text class="subText ${external}" x="238" y="111">EXTERNAL ${external.toUpperCase()}</text></svg><p class="mapLegend">${health.checkout === "DEGRADED" ? "Pods are running. Egress isolation breaks checkout." : "Green: dependency reachable · dashed: blocked"}</p>`;
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
