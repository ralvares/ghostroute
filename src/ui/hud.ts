import { S } from "../simulation/state.js";
import { $ } from "../ui/dom.js";
import { updateHealthMap } from "./health-map.js";
import { updateWorkbench } from "./workbench.js";
import { currentChapter, campaignChecks } from "../campaign/engine.js";

export function updateHUD() {
  const stage = currentChapter().title;
  $("stageName").textContent = stage;
  document.title = stage + " — OpenShift Security Adventure";
  updateWorkbench();
  updateHealthMap();
  if (S.campaign.active) {
    const chapter = currentChapter();
    const missing = campaignChecks().filter((g) => !g.passed);
    $("phase").textContent = chapter.act + " · CHAPTER " + chapter.id;
    $("objectiveTitle").textContent = chapter.title;
    $("objective").textContent = S.campaign.finished
      ? "All 27 cases are closed. Your verified handover, controls and notes remain in prod-east."
      : (missing[0]?.label ??
        "Conclude the case at the bastion: case conclude " +
          chapter.conclusion);
    $("exposure").textContent = missing.length ? "UNVERIFIED" : "VERIFIED";
    $("exposure").className = missing.length ? "warn" : "good";
    $("exposureDetail").textContent =
      chapter.namespace + " · " + missing.length + " objectives remain";
    return;
  }
  let title, txt, phase;
  if (!S.incident.explained && S.evidence.size >= 3) {
    phase = "CASE 018 · EXPLAIN THE CHANGE";
    title = "Who changed the telemetry?";
    txt =
      "Correlate the build-bot audit request, case/release-job.json and case/permission-review.yaml. Explain the mechanism before closing the incident.";
  } else if (S.done) {
    phase = "CASE 018 · RESOLVED";
    title = "Route secured. District restored.";
    txt = "The payment service survived. The case is closed.";
  } else if (S.policy === "deny") {
    phase = "CASE 018 · CUSTOMER IMPACT";
    title = "Checkout is degraded.";
    txt =
      "Both Pods are Ready, but DNS and ledger are blocked. Restore only the required egress.";
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
  if (S.env && S.evidence.size < 2 && S.policy !== "deny") {
    const scene = S.world.scene;
    if (scene === "district") {
      title = "Follow the ghost signal.";
      txt =
        "Meet Rhea for the RHACS incident report. Then ask Mira in the prod-east lobby for worker-room access.";
    } else if (scene === "soc") {
      title = "Search the operator hub.";
      txt =
        "Talk to Rhea. Search the maintenance locker. Use the bastion here after gathering your evidence.";
    } else if (scene === "cluster") {
      title = "Four doors. One changed service.";
      txt =
        "Show Mira the incident report to obtain worker access. Interview Kai and Vale, then return to the RHACS Central bastion.";
    } else if (scene === "archive") {
      title = "Trace the configuration change.";
      txt =
        "Interview Vale and inspect the release record. Save the leads in your notebook, then investigate at the bastion.";
    } else if (scene === "operations") {
      title = "Inspect the application build.";
      txt =
        "Ask Kai why the owned application needs root. Take his build notes back to the bastion for the SCC lab.";
    }
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
    S.policy === "allow"
      ? "CONTAINED"
      : S.policy === "deny"
        ? "ISOLATED"
        : S.env
          ? "UNCONTROLLED"
          : "OPEN PATH";
  $("exposure").className =
    S.policy === "allow"
      ? "good"
      : S.policy === "deny"
        ? "warn"
        : S.env
          ? "bad"
          : "warn";
  $("exposureDetail").textContent =
    S.policy === "allow"
      ? "Only required Pod egress"
      : S.policy === "deny"
        ? "All Pod egress blocked"
        : "No enforced egress boundary";
}
