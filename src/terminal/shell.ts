import { S } from "../simulation/state.js";
import { G, C } from "../game/runtime.js";
import { $ } from "../ui/dom.js";
import { closeRadio } from "../characters/dialogue.js";
import { worldObjects } from "../world/locations.js";
import { toast } from "../ui/notifications.js";
import { suggest } from "../terminal/completion.js";
import { closePager } from "./pager.js";

// Simulated OpenShift shell.
export function openTerminal() {
  if (!S.started || G.detailOpen || G.endOpen || !$("opening").hidden) return;
  if (G.miraReaction && !G.miraReaction.arrived) return;
  const desk = worldObjects().find((o) => o.id === "ops");
  if (!desk || Math.hypot(S.x - desk.x, S.y - desk.y) > 105) {
    toast(
      "Use the bastion at RHACS Central. Walk up to the console and interact.",
    );
    return;
  }
  G.caseOpen = false;
  $("casepanel").hidden = true;
  closeRadio();
  G.terminalOpen = true;
  $("shellshade").hidden = false;

  if (!$("termOutput").children.length) {
    print(
      `Connected to OpenShift training bastion. Context: prod-east\nYou have a real-feeling command prompt in a bounded OFFLINE simulation.\nType help or use TAB to explore. Nothing is sent to any cluster.`,
      "meta",
    );
  }
  $("termInput").value = "";
  suggest();
  setTimeout(() => $("termInput").focus(), 25);
}

export function closeTerminal() {
  closePager(false);
  G.terminalOpen = false;
  $("shellshade").hidden = true;

  switchPrompt();
  if (S.started) C.focus();
}

export function print(msg: string, typ = "reply") {
  const node = document.createElement("div");
  node.className = "termline " + typ;
  node.textContent = msg;
  $("termOutput").appendChild(node);
  $("termOutput").scrollTop = $("termOutput").scrollHeight;
}

export function printError(s: string) {
  print(s, "error");
}

export function yes(s: string) {
  print(s, "success");
}

export function switchPrompt() {
  G.podShell = false;
  $("termPrompt").textContent =
    S.cluster.user +
    "@bastion:" +
    S.cluster.cwd.replace(/^\/home\/operator(?=\/|$)/, "~") +
    "$";
  $("termPrompt").title = $("termPrompt").textContent ?? "";
  $("termTitle").textContent = S.cluster.user + "@bastion — shell";
}
