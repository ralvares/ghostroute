import { S } from "../simulation/state.js";
import { G } from "../game/runtime.js";
import { esc } from "./notifications.js";
import { openDetail, closeDetail } from "./panels.js";
import { closeTerminal } from "../terminal/shell.js";
import { worldObjects } from "../world/locations.js";
import { discoveryNames } from "../world/story.js";
import { listDirectory } from "../simulation/filesystem.js";
import { offlineStatus } from "../game/offline.js";
import { progressStatus, scheduleSave } from "../simulation/persistence.js";
import { currentChapter, campaignChecks } from "../campaign/engine.js";
import { chapters } from "../campaign/catalog.js";
import { showJourney } from "./campaign.js";
const el = (id: string) => document.getElementById(id)!;
export function syncNotebook() {
  for (const id of ["caseNotes", "bastionNotes"]) {
    const field = el(id) as HTMLTextAreaElement;
    if (field.value !== S.story.notes) field.value = S.story.notes;
  }
}
export function updateWorkbench() {
  const completed =
    S.evidence.size +
    Number(!S.env) +
    Number(S.policy === "allow") +
    Math.min(3, S.checked.size);
  el("missionProgress").textContent =
    `${S.campaign.active ? Math.round((100 * campaignChecks().filter((g) => g.passed).length) / campaignChecks().length) : S.done ? 100 : Math.min(99, completed * 10)}%`;
  el("episodeLabel").textContent =
    "CHAPTER " + currentChapter().id + " / " + chapters.length;
  el("episodeTitle").textContent = currentChapter().title;
  if (S.campaign.active) {
    el("evidenceCount").textContent =
      S.campaign.interviews.length +
      S.campaign.evidence.length +
      Number(S.campaign.artifactFound) +
      " / 6";
    el("anomalyText").textContent = currentChapter().hook;
    syncNotebook();
    return;
  }
  el("anomalyText").textContent = S.findings.baselineDeviation
    ? "Unexpected payment-api egress. Ask Rhea what RHACS observed."
    : S.env
      ? "External connection blocked by policy."
      : "Unexpected exporter configuration removed.";
  syncNotebook();
}
function updateLocalStatus() {
  const offline =
    offlineStatus.state === "ready"
      ? "Offline ready"
      : offlineStatus.state === "development"
        ? "Development preview"
        : ["error", "unavailable"].includes(offlineStatus.state)
          ? "Offline cache unavailable"
          : "Preparing offline files…";
  const saved =
    progressStatus.state === "saved"
      ? "Notes + progress saved"
      : progressStatus.state === "saving"
        ? "Saving…"
        : progressStatus.state === "error"
          ? "Local save unavailable"
          : "Autosave enabled";
  el("localStatus").textContent = `${offline} · ${saved}`;
  el("localStatus").title = offlineStatus.error || progressStatus.error;
}
export function registerWorkbench() {
  for (const id of ["caseNotes", "bastionNotes"])
    el(id).addEventListener("input", (event) => {
      S.story.notes = (event.target as HTMLTextAreaElement).value;
      syncNotebook();
      scheduleSave();
    });
  el("anomalyDetails").addEventListener("click", () => {
    closeTerminal();
    const witness = worldObjects().find(
      (object) => object.id === "rhea" || object.id === "soc-entry",
    );
    if (witness) {
      G.pending = witness;
      G.target = { x: witness.x + 35, y: witness.y + 35 };
    } else
      openDetail(
        '<div class="eyebrow">CASE LEAD</div><h2>Return to Rhea.</h2><p>Meet the RHACS analyst at the operator hub. She can explain the original observation. Use the bastion there to investigate your evidence.</p>',
      );
  });
  document.querySelectorAll<HTMLButtonElement>("[data-nav]").forEach((button) =>
    button.addEventListener("click", () => {
      const view = button.dataset.nav;
      if (view === "journey") {
        showJourney();
        return;
      }
      if (view === "map") {
        closeDetail();
        return;
      }
      if (!S.started || G.endOpen) return;
      closeTerminal();
      const heading = `<div class="eyebrow">CHAPTER ${currentChapter().id}</div><h2>${esc(button.textContent)}</h2>`;
      if (view === "inventory")
        openDetail(
          heading +
            `<div class="storyInventory"><img class="inventoryKey" src="${import.meta.env.BASE_URL}art/keycard.webp" alt="Physical access badge"><ul><li>Worker investigation pass: ${S.story.inventory.includes("worker-pass") ? "Issued by Mira" : "Talk to Rhea, then Mira"}</li><li>Maintenance keycard: ${S.story.inventory.includes("maintenance-keycard") ? "Acquired · records archive unlocked" : "Search the operator hub locker"}</li></ul></div><p>These badges open story rooms. They do not change cluster RBAC or SCC grants.</p><p>All lab manifests, policy files and audit logs are available at the bastion. Use <code>cd</code>, <code>ls</code> and <code>cat README.md</code> there.</p><pre class="journal">${esc(listDirectory("/home/operator", true))}</pre>`,
        );
      else
        openDetail(
          heading +
            `<h3>Verified handovers</h3><ul>${S.campaign.reports.map((r) => `<li>Chapter ${chapters[r.chapter].id} · ${esc(chapters[r.chapter].title)} · ${esc(r.conclusion)}</li>`).join("") || "<li>No campaign reports yet.</li>"}</ul><p>Current chapter interviews: ${esc(S.campaign.interviews.join(", ") || "none")}. Retained records read: ${S.campaign.evidence.length}/3.</p><div class="eyebrow">DISCOVERY LOG</div><ul>${S.story.discoveries.map((id) => `<li>${esc(discoveryNames[id])}</li>`).join("") || "<li>No leads yet. Meet Rhea at RHACS Central.</li>"}</ul><p>Evidence: ${S.evidence.size}/5 · verification: ${S.checked.size}/3 · ${S.interruptions} service disruptions.</p><h3>Your notebook</h3><pre class="journal">${esc(S.story.notes || "Use the notebook below the map to record leads.")}</pre><h3>Bastion history</h3><pre class="journal">${esc(S.history.join("\n") || "No commands yet. Gather evidence, then use the bastion.")}</pre>`,
        );
    }),
  );
  new MutationObserver(updateLocalStatus).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-offline", "data-progress"],
  });
  updateLocalStatus();
  updateWorkbench();
}
