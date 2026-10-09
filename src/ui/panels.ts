import { G, C } from "../game/runtime.js";
import { $ } from "../ui/dom.js";
import { S } from "../simulation/state.js";
import type { ClueId } from "../security/evidence.js";
import { clues } from "../security/evidence.js";
import { esc } from "../ui/notifications.js";
import { showCampaignCase } from "./campaign.js";
import { campaignChecks, currentChapter } from "../campaign/engine.js";

export function openDetail(html: string) {
  G.detailOpen = true;
  $("detailsBody").innerHTML =
    html +
    `<div class="modal-foot"><span class="hint">This is evidence, not a one-click fix.</span><button type="button" class="btnquiet" id="detailDone">Return to world ↵</button></div>`;
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
              `<button type="button" class="evidenceSlot ${S.evidence.has(k as ClueId) ? "collected" : ""}" data-clue="${k}" aria-label="${esc(v.name)}: ${S.evidence.has(k as ClueId) ? "collected" : "not discovered"}" title="${esc(v.name)}">${S.evidence.has(k as ClueId) ? `<img class="uiIcon" src="${import.meta.env.BASE_URL}ui/folder.svg" alt="" />` : ""}</button>`,
          )
          .join("");
    $("evidenceList")
      .querySelectorAll<HTMLButtonElement>("[data-clue]")
      .forEach((button) =>
        button.addEventListener("click", () => {
          const key = button.dataset.clue as ClueId,
            clue = clues[key];
          closeCaseFile();
          openDetail(
            `<div class="eyebrow">CASE EVIDENCE</div><h2>${esc(clue.name)}</h2><p>${S.evidence.has(key) ? esc(clue.text) : "Not discovered yet — explore or investigate with oc."}</p><p>A deviation is a lead, not proof of compromise.</p>`,
          );
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
      ? `<button class="btnquiet caseContextButton" id="caseObjectives">Current objectives · ${campaignChecks().filter((g) => g.passed).length} / ${campaignChecks().length} complete</button>`
      : S.evidence.size
        ? `<details><summary>Who changed it, and how?</summary><p>${S.incident.auditSeen ? "✓" : "○"} Build-bot audit request · ${S.incident.releaseSeen ? "✓" : "○"} Matching release run · ${S.incident.accessSeen ? "✓" : "○"} Permission review · ${S.incident.explained ? "✓ Cause explained" : "○ Cause not explained"}</p><p>At the bastion: <code>case hint</code>.</p></details>`
        : "";
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
