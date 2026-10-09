import { missionAlert } from "../simulation/mission-alerts.js";
import { radio } from "../characters/dialogue.js";
import { closeTerminal } from "../terminal/shell.js";
import { esc } from "./notifications.js";
let signature = "";
export function updateMissionAlert() {
  let panel = document.getElementById("missionAlert");
  if (!panel) {
    panel = document.createElement("section");
    panel.id = "missionAlert";
    panel.className = "missionAlert";
    panel.setAttribute("aria-live", "polite");
    panel.setAttribute("aria-atomic", "true");
    document.getElementById("objective")!.after(panel);
  }
  const issue = missionAlert();
  panel.hidden = !issue;
  let consoleAlert = document.getElementById("bastionMissionAlert");
  if (!consoleAlert) {
    consoleAlert = document.createElement("div");
    consoleAlert.id = "bastionMissionAlert";
    consoleAlert.className = "bastionMissionAlert";
    consoleAlert.setAttribute("aria-live", "polite");
    document.getElementById("bastionHealth")!.after(consoleAlert);
  }
  consoleAlert.hidden = !issue;
  if (issue) {
    consoleAlert.innerHTML = `<strong>${esc(issue.who)} · ${esc(issue.title)}</strong><span>${esc(issue.next)}</span>`;
  } else consoleAlert.textContent = "";
  if (!issue) {
    signature = "";
    return;
  }
  if (signature === issue.key) return;
  signature = issue.key;
  panel.innerHTML = `<strong>${esc(issue.title)}</strong><p>${esc(issue.cause)}</p><p class="missionNext">${esc(issue.next)}</p><button type="button">Hear ${esc(issue.who[0] + issue.who.slice(1).toLowerCase())}'s advice</button>`;
  panel.querySelector("button")!.addEventListener("click", () => {
    closeTerminal();
    radio(issue.who, issue.cause + " " + issue.next);
  });
}
