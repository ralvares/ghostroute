import { $ } from "../ui/dom.js";
import { closeRadio, radio } from "../characters/dialogue.js";
import { G, C, keys } from "../game/runtime.js";
import { showCase, closeDetail } from "../ui/panels.js";
import { toggleTrace, interact } from "../world/interactions.js";
import { openTerminal, closeTerminal } from "../terminal/shell.js";
import { S } from "../simulation/state.js";
import { updateHUD } from "../ui/hud.js";
import { restart } from "../missions/progression.js";
import { blocked, worldPos } from "../game/movement.js";
import { objects } from "../world/locations.js";
import {
  suggest,
  candidates,
  matchSuggestion,
} from "../terminal/completion.js";
import { exec } from "../terminal/commands.js";
import { toast } from "../ui/notifications.js";
import type { WorldObject } from "../world/locations.js";

export function registerControls() {
  $("radioClose").addEventListener("click", closeRadio);
  $("closeCase").addEventListener("click", () => {
    G.caseOpen = false;
    $("casepanel").hidden = true;
    C.focus();
  });
  $("caseBtn").addEventListener("click", showCase);
  $("traceBtn").addEventListener("click", toggleTrace);
  $("terminalBtn").addEventListener("click", openTerminal);
  $("startBtn").addEventListener("click", () => {
    S.started = true;
    G.active = true;
    $("opening").hidden = true;
    C.focus();
    radio(
      "RHEA",
      "Both payment Pods report Ready. That makes this harder: the system looks healthy. Press Space to trace traffic, and come see me or the RHACS station.",
    );
    updateHUD();
  });
  $("restartTop").addEventListener("click", restart);
  C.addEventListener("click", (e) => {
    if (!S.started || blocked()) {
      return;
    }
    C.focus();
    const p = worldPos(e);
    let hit: WorldObject | null = null,
      dist = 85;
    for (const o of objects) {
      const d = Math.hypot(p.x - o.x, p.y - o.y);
      if (d < dist) {
        hit = o;
        dist = d;
      }
    }
    if (hit) {
      G.pending = hit;
      const a = Math.atan2(S.y - hit.y, S.x - hit.x);
      G.target = {
        x: Math.max(55, Math.min(1118, hit.x + Math.cos(a) * 34)),
        y: Math.max(110, Math.min(594, hit.y + Math.sin(a) * 34)),
      };
      if (Math.hypot(S.x - hit.x, S.y - hit.y) < 70) {
        G.target = null;
        G.pending = null;
        interact(hit);
      }
    } else {
      G.target = {
        x: Math.max(55, Math.min(1118, p.x)),
        y: Math.max(110, Math.min(594, p.y)),
      };
      G.pending = null;
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.target === $("termInput")) return;
    if (G.detailOpen) {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        closeDetail();
      }
      return;
    }
    if (G.endOpen) return;
    if (e.key === "Escape") {
      if (G.caseOpen) {
        G.caseOpen = false;
        $("casepanel").hidden = true;
      } else closeRadio();
      return;
    }
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
    exec(v);
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
      let v = $("termInput").value,
        ms = [
          ...new Set([...S.history.slice().reverse(), ...candidates()]),
        ].filter((c) => c.startsWith(v) && c !== v);
      if (ms.length) {
        $("termInput").value = ms[G.tabIndex % ms.length];
        G.tabIndex++;
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
  $("closeTerm").addEventListener("click", closeTerminal);
  // modal click outside and escape
  $("details").addEventListener("click", (e) => {
    if (e.target === $("details")) closeDetail();
  });
  $("opening").addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("startBtn").click();
  });
}
