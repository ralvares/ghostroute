import { updateMissionAlert } from "./mission-alert.js";
import { projectHealth } from "../simulation/health.js";
import { S } from "../simulation/state.js";
import { $ } from "../ui/dom.js";
import { updateHealthMap } from "./health-map.js";
import { updateWorkbench } from "./workbench.js";
import { currentChapter, campaignChecks } from "../campaign/engine.js";
import { esc } from "./notifications.js";
import { G } from "../game/runtime.js";
import { missingIncidentEvidence } from "../missions/incident-guide.js";
import { incidentNextAction } from "../missions/guidance.js";
import { campaignNextAction } from "../campaign/guidance.js";

function showSteps(text: string) {
  const initial = !S.campaign.active && S.env && S.evidence.size < 2;
  const steps =
    initial && S.world.scene === "district"
      ? [
          {
            text: "Meet Rhea for the RHACS incident report",
            done: S.evidence.has("rhacs"),
          },
          {
            text: "Ask Mira in the prod-east lobby for worker-room access",
            done: S.story.inventory.includes("worker-pass"),
          },
        ]
      : initial && S.world.scene === "soc"
        ? [
            {
              text: "Talk to Rhea for the incident report",
              done: S.evidence.has("rhacs"),
            },
            {
              text: "Search the maintenance locker",
              done: S.story.inventory.includes("maintenance-keycard"),
            },
          ]
        : S.campaign.active
          ? campaignChecks()
              .filter((g) => !g.passed)
              .slice(0, 2)
              .map((g) => ({ text: g.label, done: false }))
          : text
              .split(/(?<=[.!?])\s+/)
              .slice(0, 2)
              .map((t) => ({ text: t, done: false }));
  const active = steps.findIndex((s) => !s.done);
  const targets =
    S.world.scene === "district"
      ? ["soc-entry", "cluster-entry"]
      : S.world.scene === "soc"
        ? ["rhea", "locker"]
        : [];
  G.markerObjectives =
    initial && targets.length
      ? Object.fromEntries(
          targets.flatMap((id, i) =>
            steps[i].done
              ? []
              : [[id, { number: i + 1, current: i === active }]],
          ),
        )
      : {};
  document.getElementById("missionSteps")!.innerHTML = steps
    .map(
      (step, i) =>
        `<li class="${step.done ? "complete" : i === active ? "current" : ""}"><span class="stepNumber">${i + 1}</span><span>${esc(step.text)}</span></li>`,
    )
    .join("");
}

export function updateHUD() {
  const stage = currentChapter().title;
  $("stageName").textContent = stage;
  document.title = stage + " — OpenShift Security Adventure";
  updateWorkbench();
  updateMissionAlert();
  updateHealthMap();
  if (S.campaign.active) {
    const chapter = currentChapter();
    const missing = campaignChecks().filter((g) => !g.passed);
    $("phase").textContent = chapter.act + " · CHAPTER " + chapter.id;
    $("objectiveTitle").textContent = chapter.title;
    $("objective").textContent = S.campaign.finished
      ? "All 27 cases are closed. Your verified handover, controls and notes remain in prod-east."
      : campaignNextAction().detail;
    $("exposure").textContent = missing.length ? "UNVERIFIED" : "VERIFIED";
    $("exposure").className = missing.length ? "warn" : "good";
    $("exposureDetail").textContent =
      chapter.namespace + " · " + missing.length + " objectives remain";
    showSteps($("objective").textContent ?? "");
    return;
  }
  let title, txt, phase;
  if (!S.incident.explained && S.evidence.size >= 3) {
    phase = "CASE 018 · EXPLAIN THE CHANGE";
    title = "Who changed the telemetry?";
    const missing = missingIncidentEvidence(S.incident);
    txt = missing.length
      ? `${missing[0].title}: ${missing[0].command}. Case file explains what to look for and keeps a copy of the command.`
      : "All three records reviewed. Open Case file and choose Answer case questions: who patched it, which release, and which imported file?";
  } else if (S.done) {
    phase = "CASE 018 · RESOLVED";
    title = "Route secured. District restored.";
    txt = "The payment service survived. The case is closed.";
  } else if (S.policy === "deny") {
    phase = "CASE 018 · CUSTOMER IMPACT";
    title = "Checkout is degraded.";
    txt =
      "A required dependency is blocked. Inspect DNS and ledger individually, then restore only the required egress.";
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
      "Review the retained records in Case file or cat ~/case/incident-018/README.md at the bastion. Original evidence remains available after remediation.";
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
  if (!S.done && (S.evidence.size >= 2 || !S.env || S.policy !== "none")) {
    const next = incidentNextAction(S);
    title = next.title;
    txt = next.detail + (next.commands.length ? " At the bastion: " + next.commands[0] : "");
  }
  $("phase").textContent = phase;
  $("objectiveTitle").textContent = title;
  $("objective").textContent = txt;
  showSteps(txt);
  const health = projectHealth(S);
  const bad = health.checkout === "DEGRADED";
  $("health").textContent = bad ? "DEGRADED" : "HEALTHY";
  $("health").className = bad ? "bad" : "good";
  $("healthDetail").textContent =
    `${health.readyPods} / ${S.deployment.desiredReplicas} replicas ready · DNS ${health.dnsAllowed ? "allowed" : "blocked"} · ledger ${health.ledgerAllowed ? "allowed" : "blocked"}`;
  $("exposure").textContent =
    !health.externalAllowed && !bad
      ? "CONTAINED"
      : !health.externalAllowed
        ? "ISOLATED"
        : S.env
          ? "UNCONTROLLED"
          : "OPEN PATH";
  $("exposure").className =
    !health.externalAllowed && !bad
      ? "good"
      : !health.externalAllowed
        ? "warn"
        : S.env
          ? "bad"
          : "warn";
  $("exposureDetail").textContent =
    !health.externalAllowed && !bad
      ? "Required dependencies allowed; external target blocked"
      : !health.externalAllowed
        ? "External target and required dependencies blocked"
        : "No enforced egress boundary";
}
