import { G, C } from "../game/runtime.js";
import { $ } from "../ui/dom.js";
import { S } from "../simulation/state.js";
import type { ClueId } from "../security/evidence.js";
import { clues, addClue } from "../security/evidence.js";
import {
  incidentRecords,
  incidentRecordStatus,
} from "../missions/incident-records.js";
import { showEnding } from "../missions/progression.js";
import { esc } from "../ui/notifications.js";
import { showCampaignCase } from "./campaign.js";
import { campaignChecks, currentChapter } from "../campaign/engine.js";
import { incidentInvestigationHTML, registerIncidentInvestigation } from "./incident-investigation.js";
import { chapterQuestion } from "../campaign/questions.js";

export function openDetail(html: string, footerHint = "This is evidence, not a one-click fix.") {
  G.detailOpen = true;
  $("detailsBody").innerHTML =
    html +
    `<div class="modal-foot"><span class="hint">${esc(footerHint)}</span><button type="button" class="btnquiet" id="detailDone">Return to world ↵</button></div>`;
  $("details").hidden = false;
  $("detailDone").addEventListener("click", closeDetail);
}

export function closeDetail() {
  G.detailOpen = false;
  $("details").hidden = true;
  C.focus();
}

export function showCase() {
  if (!S.started || G.terminalOpen || G.detailOpen || G.endOpen) return;
  G.caseOpen = !G.caseOpen;
  $("casepanel").hidden = !G.caseOpen;
  if (G.caseOpen) {
    document.getElementById("caseFileLabel")!.textContent = S.campaign.active
      ? "CHAPTER " + currentChapter().id
      : "CASE 018";
    const chapter = currentChapter();
    document.getElementById("retainedEvidenceHelp")!.hidden =
      !!S.campaign.active;
    const fieldRecords = [
      ...chapter.witnesses.map((w) => ({
        name: "Interview " + w.who.toUpperCase(),
        collected: S.campaign.interviews.includes(w.who),
      })),
      { name: chapter.artifact.title, collected: S.campaign.artifactFound },
      ...["briefing.txt", "evidence.json", "handover.txt"].map((name) => ({
        name,
        collected: S.campaign.evidence.includes(name),
      })),
    ];
    document.getElementById("caseEvidenceCount")!.textContent = S.campaign
      .active
      ? `${fieldRecords.filter((g) => g.collected).length} / ${fieldRecords.length} evidence`
      : `${S.evidence.size} / 5 evidence`;
    $("evidenceList").style.gridTemplateColumns =
      `repeat(${S.campaign.active ? fieldRecords.length : 5}, minmax(0,1fr))`;
    $("evidenceList").innerHTML = S.campaign.active
      ? fieldRecords
          .map(
            (record) =>
              `<button type="button" class="evidenceSlot ${record.collected ? "collected" : ""}" data-campaign-record aria-label="${esc(record.name)}: ${record.collected ? "collected" : "not discovered"}" title="${esc(record.name)}">${record.collected ? `<img class="uiIcon" src="${import.meta.env.BASE_URL}ui/folder.svg" alt="" />` : ""}</button>`,
          )
          .join("")
      : Object.entries(clues)
          .map(
            ([k, v]) =>
              `<button type="button" class="evidenceSlot ${S.evidence.has(k as ClueId) ? "collected" : "retained"}" data-clue="${k}" aria-label="${esc(v.name)}: ${S.evidence.has(k as ClueId) ? "reviewed" : "review retained record"}" title="${esc(v.name)} · ${S.evidence.has(k as ClueId) ? "reviewed" : "record available"}"><img class="uiIcon" src="${import.meta.env.BASE_URL}ui/folder.svg" alt="" /><span class="evidenceReviewMark">${S.evidence.has(k as ClueId) ? "✓" : "+"}</span></button>`,
          )
          .join("");
    $("evidenceList")
      .querySelectorAll<HTMLButtonElement>("[data-clue]")
      .forEach((button) =>
        button.addEventListener("click", () => {
          const key = button.dataset.clue as ClueId,
            clue = clues[key],
            record = incidentRecords[key];
          closeCaseFile();
          openDetail(
            `<div class="eyebrow">CASE 018 · RETAINED EVIDENCE</div><h2>${esc(clue.name)}</h2><p class="recordState">${esc(incidentRecordStatus(S, key))} · ${S.evidence.has(key) ? "Evidence reviewed" : "Evidence available for review"}</p><p>${esc(clue.text)}</p><p class="recordSource">${esc(record.source)} · captured ${esc(record.capturedAt)}. This record describes the incident before remediation.</p><pre class="incidentRecord" tabindex="0" aria-label="Retained ${esc(clue.name)}">${esc(record.content)}</pre><div class="notebookCommand"><code>cat ~/${esc(record.path)}</code><button type="button" data-copy-command="cat ~/${esc(record.path)}" aria-label="Copy command: cat ~/${esc(record.path)}">Copy</button></div><p>A deviation is a lead, not proof of compromise. Fixing the cluster does not erase the case records.</p>${S.evidence.has(key) ? "" : '<button type="button" class="btnquiet" id="reviewIncidentRecord">Mark evidence reviewed</button>'}`,
          );
          document
            .getElementById("reviewIncidentRecord")
            ?.addEventListener("click", () => {
              closeDetail();
              addClue(key);
              if (!G.endOpen) showCase();
            });
        }),
      );
    $("evidenceList")
      .querySelectorAll("[data-campaign-record]")
      .forEach((button) =>
        button.addEventListener("click", () => {
          closeCaseFile();
          showCampaignCase();
        }),
      );
    const context = document.getElementById("caseContext")!;
    context.innerHTML = S.campaign.active
      ? `<section class="incidentInvestigation"><h3>Your case question</h3><p class="campaignQuestionPrompt">${esc(chapterQuestion(chapter).question)}</p><p>Read <code>${esc(chapterQuestion(chapter).command.slice(4))}</code>, field <code>${esc(chapterQuestion(chapter).field)}</code>.</p><button type="button" class="btnquiet caseContextButton" id="caseObjectives">View checks and answer · ${campaignChecks().filter((g) => g.passed).length} / ${campaignChecks().length} complete</button><p class="investigationFootnote">Hints and retries are available. Finish your fixes and verification before submitting.</p></section>`
      : `${incidentInvestigationHTML()}${S.done ? '<button type="button" class="btnquiet" id="caseDebrief">Return to debrief</button>' : ""}`;
    if (!S.campaign.active) registerIncidentInvestigation();
    document.getElementById("caseDebrief")?.addEventListener("click", () => {
      closeCaseFile();
      showEnding();
    });
    document.getElementById("caseObjectives")?.addEventListener("click", () => {
      closeCaseFile();
      showCampaignCase();
    });
    $("closeCase").focus();
  }
}

export function closeCaseFile() {
  G.caseOpen = false;
  $("casepanel").hidden = true;
  queueMicrotask(() => {
    if (!G.detailOpen && !G.terminalOpen) $("caseBtn").focus();
  });
}
