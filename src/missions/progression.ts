import { switchPrompt, closeTerminal } from "../terminal/shell.js";
import { resetSimulation } from "../simulation/operations.js";
import { S } from "../simulation/state.js";
import { G } from "../game/runtime.js";
import { closeRadio } from "../characters/dialogue.js";
import { closeDetail } from "../ui/panels.js";
import { $ } from "../ui/dom.js";
import { updateSceneHUD } from "../world/scenes.js";
import { updateHUD } from "../ui/hud.js";

export function restart() {
  switchPrompt();
  resetSimulation();
  G.traceOn = false;
  G.walking = false;
  G.target = null;
  G.pending = null;
  closeRadio();
  closeTerminal();
  closeDetail();
  G.caseOpen = false;
  $("casepanel").hidden = true;
  G.endOpen = false;
  $("ending").hidden = true;
  $("opening").hidden = false;
  G.active = false;
  $("startBtn").textContent = "Enter the district →";
  $("evidenceCount").textContent = "0 / 5";
  $("termOutput").innerHTML = "";
  updateSceneHUD();
  updateHUD();
}

export function maybeWin() {
  updateHUD();
  if (S.done) return;
  if (
    S.env === false &&
    S.policy === "allow" &&
    (S.evidence.has("rhacs") || S.evidence.has("trace")) &&
    S.evidence.size >= 3 &&
    S.checked.has("rollout") &&
    S.checked.has("positive") &&
    S.checked.has("negative")
  ) {
    S.done = true;
    showEnding();
  }
}

export function showEnding() {
  G.endOpen = true;
  G.terminalOpen = false;
  $("shellshade").hidden = true;
  closeRadio();
  const grade =
    S.evidence.size === 5 && S.interruptions === 0
      ? "S"
      : S.evidence.size >= 4 && S.interruptions === 0
        ? "A"
        : "B";
  $("endBody").innerHTML =
    `<div class="eyebrow">INCIDENT 018 · RESOLVED</div><h2>The district keeps its lights.</h2><p>The unexplained route is closed, and checkout is working. Rhea has the evidence. Mira has a verified boundary. Kai has a corrected configuration. Vale’s audit trail identifies the credential used; further attribution requires more evidence. You found the configuration cause, contained its effect, and preserved the legitimate paths.</p><div class="divider"></div><div class="row" style="align-items:center;justify-content:space-between"><div><div class="panelmeta">INCIDENT RATING</div><div class="grade">${grade}</div></div><div class="pill" style="font-size:13px;color:#b7e9d7">✓ Service restored · Unauthorized egress denied</div></div><div class="endstats"><div><b>${S.evidence.size}/5</b><small>Evidence found</small></div><div><b>${S.commands}</b><small>Commands used</small></div><div><b>${S.interruptions}</b><small>Service disruptions</small></div></div><p style="font-size:13px"><strong>What you learned:</strong> RHACS network deviations require investigation; Deployment configuration can cause unexpected behavior; NetworkPolicy enforces egress for selected Pods; a fix needs both positive and negative tests.</p><div class="modal-foot"><span class="hint">Chapter 01 complete · Security Operator path (101)</span><button class="btnred" id="playAgain" type="button">↺ Replay with a better strategy</button></div>`;
  $("ending").hidden = false;
  $("playAgain").addEventListener("click", restart);
  updateSceneHUD();
  updateHUD();
}
