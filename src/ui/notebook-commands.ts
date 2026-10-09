import { collectedCommands } from "../missions/command-leads.js";
import { S } from "../simulation/state.js";
import { esc, toast } from "./notifications.js";

let signature = "";
export function updateCommandNotebook() {
  const leads = collectedCommands(S),
    next = JSON.stringify(leads);
  if (next === signature) return;
  signature = next;
  const html = leads.length
    ? leads
        .map(
          (lead, i) =>
            `<details class="commandLead"${i === 0 ? " open" : ""}><summary>${esc(lead.source)}${lead.changes ? " · changes" : ""}</summary><p>${esc(lead.purpose)}</p>${lead.commands.map((command) => `<div class="notebookCommand"><code>${esc(command)}</code><button type="button" data-copy-command="${esc(command)}" aria-label="Copy command: ${esc(command)}">Copy</button></div>`).join("")}</details>`,
        )
        .join("")
    : '<p class="commandEmpty">Conversations and discoveries will add commands here.</p>';
  for (const id of ["caseCommands", "bastionCommands"]) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }
}
export function registerCommandNotebook() {
  for (const id of ["caseCommands", "bastionCommands", "caseContext", "detailsBody"])
    document.getElementById(id)?.addEventListener("click", async (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-copy-command]",
      );
      if (!button) return;
      try {
        await navigator.clipboard.writeText(button.dataset.copyCommand!);
        button.textContent = "Copied";
        toast("Command copied. Review it, then paste at the bastion.");
      } catch {
        const range = document.createRange();
        range.selectNodeContents(button.previousElementSibling!);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        toast("Command selected. Copy it to use at the bastion.");
      }
    });
  updateCommandNotebook();
}
