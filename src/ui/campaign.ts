import { chapters } from "../campaign/catalog.js";
import {
  advanceCampaign,
  currentChapter,
  campaignChecks,
  chapterRoot,
} from "../campaign/engine.js";
import { S } from "../simulation/state.js";
import { G, C, keys } from "../game/runtime.js";
import { openDetail, closeDetail } from "./panels.js";
import { closeTerminal } from "../terminal/shell.js";
import { radio, closeRadio } from "../characters/dialogue.js";
import { updateHUD } from "./hud.js";
import { updateSceneHUD } from "../world/scenes.js";
import { esc, toast } from "./notifications.js";
import { projectHealth } from "../simulation/health.js";
import { scheduleSave } from "../simulation/persistence.js";
import { campaignChallengeHTML, registerCampaignChallenge } from "./case-challenge.js";
import { campaignNextAction } from "../campaign/guidance.js";

export function continueJourney() {
  try {
    const previous = currentChapter();
    const ch = advanceCampaign();
    closeTerminal();
    closeDetail();
    closeRadio();
    G.endOpen = false;
    G.caseOpen = false;
    document.getElementById("ending")!.hidden = true;
    document.getElementById("casepanel")!.hidden = true;
    // Continue in place: the same cluster and investigator position persist.
    G.target = null;
    G.pending = null;
    G.near = null;
    G.traceOn = false;
    keys.clear();
    S.story.notes +=
      (S.story.notes ? "\n\n" : "") +
      "Chapter " +
      ch.id +
      " · " +
      ch.title +
      "\n" +
      ch.hook;
    updateSceneHUD();
    updateHUD();
    scheduleSave();
    C.focus();
    radio(
      "RHEA",
      "Still in prod-east. After " +
        previous.title +
        ": " +
        previous.outcome +
        " " +
        ch.hook +
        " Meet " +
        ch.witnesses
          .map((w) => w.who.toUpperCase() + " in " + w.scene)
          .join(" and ") +
        ". Search the archive, then return to the bastion.",
    );
  } catch (error) {
    toast((error as Error).message);
  }
}
export function attachJourneyButton() {
  const target = document.querySelector("#endBody .modal-foot")!;
  const button = document.createElement("button");
  button.className = "btnquiet";
  button.id = "continueJourney";
  button.textContent = "Continue journey → Chapter " + chapters[1].id;
  button.addEventListener("click", () => {
    if (S.incident.explained) continueJourney();
    else {
      G.endOpen = false;
      document.getElementById("ending")!.hidden = true;
      C.focus();
      toast(
        "This older save needs a cause review. Read the linked audit/release/permissions at the bastion and use case explain release-import.",
      );
    }
  });
  target.prepend(button);
}
export function showCampaignEnding() {
  const ch = currentChapter(),
    completed = S.campaign.finished;
  closeTerminal();
  closeRadio();
  closeDetail();
  G.endOpen = true;
  document.getElementById("endBody")!.innerHTML =
    '<div class="eyebrow">' +
    esc(ch.act) +
    " · CHAPTER " +
    ch.id +
    " RESOLVED</div><h2>" +
    esc(completed ? "The city can answer without you." : ch.title) +
    "</h2>" +
    "<p>" +
    esc(ch.outcome) +
    "</p><p>" +
    esc(
      completed
        ? "The first change is explained: release-184 imported unreviewed settings through build-bot. Its write grant is withdrawn, the import is disabled, and reviewed releases have a scan-before-sign gate. Every earlier control was checked again before this handover. Rhea keeps observations; Mira owns controls; Kai owns releases; Vale preserves evidence and exception reviews. No human attacker was established."
        : chapters[S.campaign.active + 1].hook,
    ) +
    "</p>" +
    '<div class="endstats"><div><b>' +
    S.campaign.completed.length +
    "/" +
    chapters.length +
    "</b><small>Cases closed</small></div><div><b>" +
    S.campaign.trust +
    "</b><small>Verified handovers</small></div><div><b>" +
    S.interruptions +
    "</b><small>Payment disruptions carried</small></div></div>" +
    '<p class="caseRisk">' +
    esc(ch.risk) +
    '</p><div class="modal-foot"><span class="hint">Notes and reports are saved locally.</span><button class="btnquiet" id="chapterNext">' +
    (completed ? "Return to district" : "Continue journey →") +
    "</button></div>";
  document.getElementById("ending")!.hidden = false;
  document.getElementById("chapterNext")!.addEventListener("click", () => {
    if (!completed) continueJourney();
    else {
      G.endOpen = false;
      document.getElementById("ending")!.hidden = true;
      C.focus();
    }
  });
  updateHUD();
  scheduleSave();
}
export function showJourney() {
  if (!S.started || G.endOpen) return;
  closeTerminal();
  const ch = currentChapter();
  openDetail(
    '<div class="eyebrow">THE JOURNEY · SEVEN ACTS</div><h2>The long road home</h2><p>' +
      esc(ch.hook) +
      "</p><p><strong>" +
      S.campaign.completed.length +
      " / " +
      chapters.length +
      "</strong> cases closed. " +
      (S.campaign.finished
        ? "The journey is complete. Review the retained handovers in Journal."
        : "Finish the current case to unlock the next. Your notebook and reports follow you.") +
      "</p>" +
      '<div class="journeyList">' +
      chapters
        .map(
          (c, i) =>
            '<article class="journeyCase ' +
            (i === S.campaign.active ? "current" : "") +
            '"><span>' +
            c.id +
            "</span><div><small>" +
            esc(c.act + " · " + c.district) +
            "</small><h3>" +
            esc(c.title) +
            "</h3><p>" +
            esc(
              i <= S.campaign.active
                ? c.hook
                : "Locked · continue the investigation",
            ) +
            "</p></div><b>" +
            (S.campaign.completed.includes(i)
              ? "CLOSED"
              : i === S.campaign.active
                ? "ACTIVE"
                : "LOCKED") +
            "</b></article>",
        )
        .join("") +
      "</div>",
  );
}
export function showCampaignCase() {
  closeTerminal();
  openDetail(campaignChallengeHTML(), "Submit your answer after the displayed completion checks pass.");
  registerCampaignChallenge();
}
export function campaignInterview(who: string) {
  if (!S.campaign.active) return false;
  const ch = currentChapter(),
    w = ch.witnesses.find((w) => w.who === who);
  if (!w) return false;
  const here = w.scene === S.world.scene;
  if (here && !S.campaign.interviews.includes(w.who))
    S.campaign.interviews.push(w.who);
  const next = campaignNextAction();
  openDetail(
    '<div class="eyebrow">INTERVIEW · ' +
      esc(who.toUpperCase()) +
      " · CHAPTER " +
      ch.id +
      '</div><img class="interviewPortrait" src="' +
      import.meta.env.BASE_URL +
      "art/" +
      who +
      '.webp" alt="' +
      esc(who) +
      '"><h2>' +
      esc(ch.title) +
      "</h2><p>" +
      esc(w.text) +
      "</p><p>" +
      (here
        ? "Interview recorded in the case."
        : "Meet me in " + esc(w.scene) + " to record this interview.") +
      `</p><section class="witnessNext"><h3>Next: ${esc(next.title)}</h3><p>${esc(next.detail)}</p>${next.commands.map((command) => `<div class="notebookCommand"><code>${esc(command)}</code><button type="button" data-copy-command="${esc(command)}" aria-label="Copy command: ${esc(command)}">Copy</button></div>`).join("")}</section><button class="btnquiet" id="campaignLead">Keep this lead in notebook</button>`,
  );
  document.getElementById("campaignLead")!.addEventListener("click", () => {
    const lead = who.toUpperCase() + " · " + w.text + "\nNext: " + next.title + ". " + next.detail + (next.commands.length ? "\n" + next.commands.join("\n") : "");
    if (!S.story.notes.includes(lead)) S.story.notes += "\n\n" + lead;
    updateHUD();
    scheduleSave();
    toast("Witness lead saved.");
  });
  updateHUD();
  scheduleSave();
  return true;
}
export function discoverCampaignArtifact() {
  const ch = currentChapter();
  S.campaign.artifactFound = true;
  openDetail(
    '<div class="eyebrow">ARCHIVE DISCOVERY · CHAPTER ' +
      ch.id +
      "</div><h2>" +
      esc(ch.artifact.title) +
      "</h2><p>" +
      esc(ch.artifact.text) +
      "</p><p>Record this against <code>" +
      chapterRoot() +
      "evidence.json</code> at the bastion. Keep the source limits in <code>handover.txt</code>.</p>",
  );
  updateHUD();
  scheduleSave();
}

export function showCampaignContext(who: string) {
  const ch = currentChapter(),
    health = projectHealth(S);
  const previous = chapters[Math.max(0, S.campaign.active - 1)];
  if (who === "register") {
    const pods = S.cluster.resources.filter(
      (p) => p.kind === "Pod" && p.spec?.nodeName === S.world.scene,
    );
    openDetail(
      '<div class="eyebrow">PROD-EAST · WORKER REGISTER</div><h2>' +
        esc(S.world.scene) +
        "</h2><p>Current tenant: " +
        esc(ch.namespace) +
        ". Earlier workloads remain in this cluster. Floor space shows a sample; this register lists every stored Pod scheduled here.</p><ul>" +
        pods
          .map(
            (p) =>
              "<li>" +
              esc(p.metadata.namespace) +
              " / " +
              esc(p.metadata.name) +
              " · " +
              esc(p.status?.phase) +
              "</li>",
          )
          .join("") +
        "</ul><p>Payments workloads also remain scheduled across both workers. Inspect all tenants from the bastion with <code>oc get pods -A</code>.</p>",
    );
    return;
  }
  const lines: Record<string, string> = {
    rhea:
      "Payments checkout is " +
      health.checkout.toLowerCase() +
      ". We are still observing prod-east. The next lead is " +
      ch.title +
      "; use the current case checklist, and preserve the earlier reports.",
    mira:
      "Same building, same workers. Tenant " +
      ch.namespace +
      " belongs to " +
      ch.district +
      ". The earlier boundaries and grants remain active. Physical room access does not grant API access.",
    kai:
      "We kept the workloads from the earlier investigation. The current tenant is " +
      ch.namespace +
      ". Read its briefing before changing an image or asking for an exception.",
    vale:
      "The last closed case was " +
      previous.title +
      ". Its report remains in Journal. The current archive dossier belongs to " +
      ch.title +
      "; do not substitute an older incident’s evidence.",
  };
  const next = campaignNextAction();
  openDetail(
    '<div class="eyebrow">' +
      esc(who.toUpperCase()) +
      " · PROD-EAST</div><h2>The investigation continues.</h2><p>" +
      esc(lines[who] ?? ch.hook) +
      "</p><p>Current business area: " +
      esc(ch.district) +
      ". Current tenant: " +
      esc(ch.namespace) +
      `.</p><section class="witnessNext"><h3>Next: ${esc(next.title)}</h3><p>${esc(next.detail)}</p>${next.commands.map((command) => `<div class="notebookCommand"><code>${esc(command)}</code><button type="button" data-copy-command="${esc(command)}" aria-label="Copy command: ${esc(command)}">Copy</button></div>`).join("")}</section>`,
  );
}
