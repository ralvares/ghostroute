import { S } from "../simulation/state.js";
import { $ } from "../ui/dom.js";
import { radio } from "../characters/dialogue.js";

export function updateHUD() {
  let title, txt, phase;
  if (S.done) {
    phase = "CASE 018 · RESOLVED";
    title = "Route secured. District restored.";
    txt = "The payment service survived. The case is closed.";
  } else if (S.env && S.evidence.size < 2) {
    phase = "CASE 018 · INVESTIGATE";
    title = "Where is the red traffic coming from?";
    txt =
      "Use Trace Vision (Space). Investigate RHACS, the Pods, and your terminal.";
  } else if (S.env) {
    phase = "CASE 018 · FIND THE CAUSE";
    title = "Something in payment-api changed.";
    txt =
      "Read its logs and Deployment config. Then choose how to contain the connection.";
  } else if (S.policy === "none") {
    phase = "CASE 018 · PREVENT RECURRENCE";
    title = "The suspicious setting is gone.";
    txt =
      "An open network path remains. Apply least-privilege egress controls.";
  } else if (S.policy === "deny") {
    phase = "CASE 018 · CUSTOMER IMPACT";
    title = "Checkout is failing!";
    txt =
      "Default-deny also blocked DNS and ledger. Restore required egress, not all egress.";
  } else if (!(
    (S.evidence.has("rhacs") || S.evidence.has("trace")) &&
    S.evidence.size >= 3
  )) {
    phase = "CASE 018 · EXPLAIN THE INCIDENT";
    title = "Fix deployed. Can you prove what happened?";
    txt =
      "Complete the investigation: collect RHACS/trace evidence and at least three independent clues.";
  } else {
    phase = "CASE 018 · PROVE IT";
    title = "Can customers still pay?";
    txt =
      "From a Pod, test ledger access and external blocking. Check the Deployment rollout.";
  }
  $("phase").textContent = phase;
  $("objectiveTitle").textContent = title;
  $("objective").textContent = txt;
  const bad = S.policy === "deny";
  $("health").textContent = bad ? "DEGRADED" : "HEALTHY";
  $("health").className = bad ? "bad" : "good";
  $("healthDetail").textContent = bad
    ? "Ledger requests timing out"
    : "2 / 2 replicas ready";
  $("exposure").textContent =
    S.policy === "allow" ? "CONTAINED" : S.env ? "UNCONTROLLED" : "OPEN PATH";
  $("exposure").className =
    S.policy === "allow" ? "good" : S.env ? "bad" : "warn";
  $("exposureDetail").textContent =
    S.policy === "allow"
      ? "Only required Pod egress"
      : "No enforced egress boundary";
}
