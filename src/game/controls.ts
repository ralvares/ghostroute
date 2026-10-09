import { reactionObjects, startMiraReaction } from "../world/reactions.js";
import { $ } from "../ui/dom.js";
import { closeRadio, radio } from "../characters/dialogue.js";
import { G, C, keys } from "../game/runtime.js";
import { showCase, closeDetail, closeCaseFile } from "../ui/panels.js";
import { toggleTrace, interact } from "../world/interactions.js";
import { openTerminal, closeTerminal } from "../terminal/shell.js";
import { S } from "../simulation/state.js";
import { updateHUD } from "../ui/hud.js";
import { restart } from "../missions/progression.js";
import { approachObject, blocked, worldPos } from "../game/movement.js";
import { floorPoint } from "../world/walkable.js";
import { worldObjects } from "../world/locations.js";
import {
  suggest,
  matchSuggestion,
  completionMatches,
} from "../terminal/completion.js";
import { exec } from "../terminal/commands.js";
import { toast } from "../ui/notifications.js";
import type { WorldObject } from "../world/locations.js";
import { saveProgress, scheduleSave } from "../simulation/persistence.js";
let commandQueue = Promise.resolve();
let queuedCommands = 0;
let tabCycle: { last: string; values: string[]; index: number } | null = null;

export function registerControls() {
  $("radioClose").addEventListener("click", closeRadio);
  $("closeCase").addEventListener("click", closeCaseFile);
  document
    .getElementById("caseBackdrop")!
    .addEventListener("click", closeCaseFile);
  new MutationObserver(() => {
    document.getElementById("caseBackdrop")!.hidden = $("casepanel").hidden;
    $("caseBtn").setAttribute("aria-expanded", String(!$("casepanel").hidden));
    for (const selector of [
      ".top",
      ".hudDock",
      "#world",
      "#casehud",
      "#alertCard",
    ]) {
      const element = document.querySelector<HTMLElement>(selector);
      if (element) element.inert = !$("casepanel").hidden;
    }
  }).observe($("casepanel"), { attributes: true, attributeFilter: ["hidden"] });
  $("casepanel").addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeCaseFile();
    } else if (event.key === "Tab") {
      const controls = [
        ...$("casepanel").querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea, summary, [tabindex="0"]',
        ),
      ].filter((el) => el.getClientRects().length);
      const first = controls[0],
        last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });
  const compact = matchMedia("(max-width:640px)"),
    alert = document.getElementById("alertCard") as HTMLDetailsElement;
  alert.open = !compact.matches;
  compact.addEventListener("change", () => {
    alert.open = !compact.matches;
  });
  $("caseBtn").addEventListener("click", showCase);
  $("traceBtn").addEventListener("click", toggleTrace);
  $("terminalBtn").addEventListener("click", openTerminal);
  $("startBtn").addEventListener("click", () => {
    const resuming = S.started;
    S.started = true;
    G.active = true;
    $("opening").hidden = true;
    C.focus();
    if (!resuming)
      radio(
        "RHEA",
        "Both payment Pods report Ready, but RHACS flagged a new connection. Meet me at the RHACS Central computer in the district. Then enter prod-east and inspect its worker rooms.",
      );
    if (S.policy === "deny" && !S.story.outageSeen) startMiraReaction();
    updateHUD();
    scheduleSave();
  });
  $("restartTop").addEventListener("click", restart);
  C.addEventListener("click", (e) => {
    C.focus();
    if (!S.started || blocked()) {
      return;
    }
    C.focus();
    const p = worldPos(e);
    let hit: WorldObject | null = null,
      dist = 85;
    for (const o of [...worldObjects(), ...reactionObjects()]) {
      const d = Math.hypot(p.x - o.x, p.y - o.y);
      if (d < dist) {
        hit = o;
        dist = d;
      }
    }
    if (hit) {
      approachObject(hit);
    } else {
      G.target = floorPoint(p, S.world.scene);
      G.pending = null;
    }
  });
  document.addEventListener("keydown", (e) => {
    if (
      e.target instanceof HTMLElement &&
      e.target.closest("input, textarea, [contenteditable], .worldTargets")
    )
      return;
    if (G.detailOpen) {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        closeDetail();
      }
      return;
    }
    if (G.endOpen) return;
    if (
      G.radioOpen &&
      !G.terminalOpen &&
      ["Enter", "Escape", "e", "E"].includes(e.key)
    ) {
      e.preventDefault();
      closeRadio();
      return;
    }
    if (e.key === "Escape") {
      if (G.caseOpen) {
        G.caseOpen = false;
        $("casepanel").hidden = true;
      } else closeRadio();
      return;
    }
    if (G.caseOpen) return;
    if (!S.started) return;
    if (e.key === "t" || e.key === "T" || e.key === "`") {
      e.preventDefault();
      openTerminal();
      return;
    }
    if (e.key === " ") {
      e.preventDefault();
      toggleTrace();
      return;
    }
    if (e.key === "e" || e.key === "E") {
      e.preventDefault();
      interact();
      return;
    }
    if (
      [
        "w",
        "a",
        "s",
        "d",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(e.key)
    ) {
      if (
        e.target &&
        e.target instanceof HTMLElement &&
        ["BUTTON", "INPUT", "TEXTAREA"].includes(e.target.tagName)
      )
        return;
      e.preventDefault();
      keys.add(e.key.toLowerCase());
    }
  });
  document.addEventListener("keyup", (e) => {
    keys.delete(e.key.toLowerCase());
  });
  window.addEventListener("blur", () => keys.clear());
  $("closeTerm").addEventListener("click", closeTerminal);
  $("termform").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("termInput").value;
    G.histPointer = -1;
    G.tabIndex = 0;
    $("termInput").value = "";
    suggest();
    const incident = S;
    queuedCommands++;
    $("termform").setAttribute("aria-busy", "true");
    commandQueue = commandQueue
      .then(async () => {
        try {
          if (S === incident) {
            await exec(v);
            await saveProgress();
          }
        } finally {
          queuedCommands--;
          $("termform").setAttribute("aria-busy", String(queuedCommands > 0));
        }
      })
      .catch((error) => toast((error as Error).message));
  });
  $("termInput").addEventListener("input", () => {
    G.histPointer = -1;
    G.tabIndex = 0;
    suggest();
  });
  $("termInput").addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeTerminal();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const v = $("termInput").value;
      if (!tabCycle || tabCycle.last !== v) {
        tabCycle = {
          last: v,
          values: completionMatches(
            v,
            $("termInput").selectionStart ?? v.length,
          ),
          index: -1,
        };
      }
      const ms = tabCycle.values;
      if (ms.length) {
        tabCycle.index =
          (tabCycle.index + (e.shiftKey ? ms.length - 1 : 1)) % ms.length;
        $("termInput").value = ms[tabCycle.index];
        tabCycle.last = $("termInput").value;
        suggest();
      } else {
        toast("No completions for that prefix");
      }
      return;
    }
    if (
      e.key === "ArrowRight" &&
      $("termInput").selectionStart === $("termInput").value.length
    ) {
      let m = matchSuggestion($("termInput").value);
      if (m) {
        e.preventDefault();
        $("termInput").value = m;
        suggest();
      }
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!S.history.length) return;
      G.histPointer =
        G.histPointer < 0
          ? S.history.length - 1
          : Math.max(0, G.histPointer - 1);
      $("termInput").value = S.history[G.histPointer];
      suggest();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (G.histPointer < 0) return;
      G.histPointer++;
      $("termInput").value =
        G.histPointer < S.history.length ? S.history[G.histPointer] : "";
      if (G.histPointer >= S.history.length) G.histPointer = -1;
      suggest();
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      $("termOutput").innerHTML = "";
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === "r") {
      e.preventDefault();
      const q = $("termInput").value;
      const x = S.history
        .slice()
        .reverse()
        .find((a) => a.includes(q));
      if (x) {
        $("termInput").value = x;
        suggest();
      } else toast("No matching command in history");
    }
  });
  // modal click outside and escape
  $("details").addEventListener("click", (e) => {
    if (e.target === $("details")) closeDetail();
  });
  $("opening").addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("startBtn").click();
  });
}
