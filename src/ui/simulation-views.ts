import { startMiraReaction } from "../world/reactions.js";
import { G } from "../game/runtime.js";
import { subscribe } from "../simulation/events.js";
import { updateHUD } from "./hud.js";
import { S } from "../simulation/state.js";
import type { DomainEvent } from "../simulation/events.js";

/** Coalesce rollout/audit events into one visible change; health projection is immediate. */
export function registerSimulationViews() {
  let timer = 0;
  let clearTimer = 0;
  let messages: { priority: number; text: string }[] = [];
  function message(event: DomainEvent) {
    const d = event.data;
    if (event.type === "policy.applied")
      return {
        priority: 10,
        text:
          S.policy === "deny"
            ? "CHECKOUT DEGRADED · Default-deny blocked DNS and ledger. Both payment Pods remain Ready."
            : S.policy === "allow"
              ? "CHECKOUT HEALTHY · DNS and ledger restored. External egress blocked."
              : "Network policy updated.",
      };
    if (
      event.type === "cluster.request" &&
      d.resource === "pods" &&
      Number(d.code) >= 400 &&
      String(d.message).includes("unable to validate")
    )
      return {
        priority: 7,
        text: `POD ADMISSION BLOCKED · ${d.namespace}/${d.name}. Inspect the SCC failure at the bastion.`,
      };
    if (event.type === "deployment.updated")
      return {
        priority: 8,
        text: "Deployment changed · telemetry endpoint removed. Two replacement Pods rolled out.",
      };
    if (
      event.type === "cluster.request" &&
      ["create", "patch", "update", "delete"].includes(String(d.verb)) &&
      event.actor === "operator"
    )
      return {
        priority: 4,
        text:
          Number(d.code) >= 400
            ? `CHANGE DENIED · ${d.resource}/${d.name || d.namespace} · ${d.code}. Inspect the terminal error.`
            : `${String(d.verb).toUpperCase()} · ${d.resource}/${d.name || d.namespace} · ${d.namespace || "cluster scope"}`,
      };
    return null;
  }
  return subscribe((event) => {
    if (
      [
        "security.reevaluated",
        "evidence.collected",
        "simulation.reset",
        "cluster.request",
      ].includes(event.type)
    )
      updateHUD();
    if (event.type === "simulation.reset") {
      clearTimeout(timer);
      clearTimeout(clearTimer);
      messages = [];
      G.miraReaction = null;
      document.getElementById("changeNotice")!.hidden = true;
      return;
    }
    const change = message(event);
    if (change) {
      messages.push(change);
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        updateHUD();
        const notice = document.getElementById("changeNotice")!;
        notice.textContent = messages.sort(
          (a, b) => b.priority - a.priority,
        )[0].text;
        notice.hidden = false;
        notice.classList.remove("changed");
        void notice.offsetWidth;
        notice.classList.add("changed");
        messages = [];
        clearTimeout(clearTimer);
        clearTimer = window.setTimeout(() => {
          notice.hidden = true;
        }, 8000);
      }, 60);
    }
    if (event.type === "policy.applied" && event.data.outageStarted)
      startMiraReaction();
  });
}
