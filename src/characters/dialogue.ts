import { S } from "../simulation/state.js";
import { G } from "../game/runtime.js";
import { $ } from "../ui/dom.js";

export function radio(who: string, msg: string, commands: string[] = []) {
  if (!S.started || G.endOpen) return;
  G.radioOpen = true;
  $("radioName").textContent = who;
  $("radioText").textContent = msg;
  let commandPanel = document.getElementById("radioCommands");
  if (!commandPanel) {
    commandPanel = document.createElement("div");
    commandPanel.id = "radioCommands";
    $("radioText").after(commandPanel);
  }
  commandPanel.replaceChildren();
  for (const command of commands) {
    const row = document.createElement("div"), code = document.createElement("code"), button = document.createElement("button");
    row.className = "notebookCommand";
    code.textContent = command;
    button.type = "button";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy command: " + command);
    button.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(command); button.textContent = "Copied"; }
      catch { const range = document.createRange(); range.selectNodeContents(code); const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range); button.textContent = "Select"; }
    });
    row.append(code, button);
    commandPanel.append(row);
  }
  $("radioPortrait").replaceChildren();
  const portrait = document.createElement("img");
  portrait.src = `${import.meta.env.BASE_URL}art/${["RHEA","MIRA","KAI","VALE"].includes(who) ? who.toLowerCase() : "mira"}.webp`;
  portrait.alt = "";
  $("radioPortrait").appendChild(portrait);
  $("radio").hidden = false;
  $("nearby").hidden = true;
}

export function closeRadio() {
  G.radioOpen = false;
  $("radio").hidden = true;
}
