import { G, C } from "../game/runtime.js";
import { $ } from "../ui/dom.js";
import { S } from "../simulation/state.js";
import type { ClueId } from "../security/evidence.js";
import { clues } from "../security/evidence.js";
import { esc } from "../ui/notifications.js";
import { showCampaignCase } from "./campaign.js";

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
  if (S.campaign.active) {
    showCampaignCase();
    return;
  }
  G.caseOpen = !G.caseOpen;
  $("casepanel").hidden = !G.caseOpen;
  if (G.caseOpen) {
    $("evidenceList").innerHTML =
      Object.entries(clues)
        .map(
          ([k, v]) =>
            `<div class="evidence"><b>${S.evidence.has(k as ClueId) ? "✓" : "◇"} ${esc(v.name)}</b>${S.evidence.has(k as ClueId) ? `<p>${esc(v.text)}</p>` : '<p class="lock">Not discovered yet — explore or investigate with oc.</p>'}</div>`,
        )
        .join("") +
      `<h3>Who changed it, and how?</h3><p>${S.incident.auditSeen ? "✓" : "○"} Build-bot audit request · ${S.incident.releaseSeen ? "✓" : "○"} Matching release run · ${S.incident.accessSeen ? "✓" : "○"} Permission review · ${S.incident.explained ? "✓ Cause explained" : "○ Cause not explained"}</p><p>At the bastion: <code>case hint</code>.</p>`;
  }
}
