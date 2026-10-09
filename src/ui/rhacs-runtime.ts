import { S } from "../simulation/state.js";
import { esc, toast } from "./notifications.js";
import {
  setBaselineLocked,
  baselinePolicyId,
} from "../security/rhacs/runtime.js";
import { scheduleSave } from "../simulation/persistence.js";
export function runtimePanel() {
  const runtime = S.cluster.rhacs.runtime;
  return `<div class="divider"></div><h3>Runtime investigation</h3><p>Alerts record an observation. Exec may be authorized support work. Compare caller, timestamp, Pod UID, process arguments and ancestry before attributing an attack.</p>${
    runtime.alerts.length
      ? runtime.alerts
          .slice(-8)
          .reverse()
          .map(
            (a) =>
              `<div class="runtimeAlert"><strong>${esc(a.policy.name)}</strong><p>${esc(a.namespace)}/${esc(a.deployment.name)} · ${esc(a.state)} · ${esc(a.time)}<br>${esc(a.violations.at(-1)?.message ?? "")}${a.enforcement ? "<br>Pod termination: " + esc(a.enforcement.message) : ""}</p></div>`,
          )
          .join("")
      : "<p>No runtime alerts recorded yet. Run an authorized oc exec or oc rsh from the bastion, then inspect this console.</p>"
  }<p>Evidence: <code>rhacs/alerts.json</code>, <code>rhacs/processes.json</code> and <code>rhacs/baselines.json</code>. Audit requests are in <code>audit/kube-apiserver.log</code>.</p><h3>Process baselines</h3><p>Unlocked baselines learn process names. Lock only after observing representative legitimate traffic. A lock does not terminate Pods; runtime enforcement must be enabled separately.</p>${runtime.baselines.map((b) => `<div class="runtimeAlert"><strong>${esc(b.key.namespace)} · ${esc(b.key.containerName)}</strong><p>${b.elements.map((e) => esc(e.element.processName)).join(", ") || "No observed processes"} · ${b.userLockedTimestamp || b.stackRoxLockedTimestamp ? "Locked" : "Learning"}</p><button class="btnquiet" data-baseline="${esc(b.id)}">${b.userLockedTimestamp || b.stackRoxLockedTimestamp ? "Unlock" : "Lock"} baseline</button></div>`).join("")}<button class="btnquiet" id="runtimeEnforcement">${S.cluster.rhacs.policyOverrides[baselinePolicyId]?.enforcementActions?.includes("KILL_POD_ENFORCEMENT") ? "Disable" : "Enable"} Pod termination for baseline deviations</button><p>This changes the offline Central policy. Default process policies notify without terminating Pods.</p>`;
}
export function bindRuntimePanel(refresh: () => void) {
  document
    .querySelectorAll<HTMLButtonElement>("[data-baseline]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        const b = S.cluster.rhacs.runtime.baselines.find(
          (b) => b.id === button.dataset.baseline,
        )!;
        setBaselineLocked(
          b.id,
          !(b.userLockedTimestamp || b.stackRoxLockedTimestamp),
        );
        scheduleSave();
        refresh();
      }),
    );
  document
    .getElementById("runtimeEnforcement")
    ?.addEventListener("click", () => {
      const current =
        S.cluster.rhacs.policyOverrides[baselinePolicyId]?.enforcementActions ??
        [];
      S.cluster.rhacs.policyOverrides[baselinePolicyId] = {
        ...S.cluster.rhacs.policyOverrides[baselinePolicyId],
        enforcementActions: current.includes("KILL_POD_ENFORCEMENT")
          ? []
          : ["KILL_POD_ENFORCEMENT"],
      };
      scheduleSave();
      toast("Offline Central runtime enforcement updated.");
      refresh();
    });
}
