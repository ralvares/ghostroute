import { S } from "../simulation/state.js";
import { G, C } from "../game/runtime.js";
import { $ } from "../ui/dom.js";
import { closeRadio } from "../characters/dialogue.js";
import { suggest } from "../terminal/completion.js";

// Simulated OpenShift shell.
export function openTerminal() {
  if (!S.started || G.detailOpen || G.endOpen || !$("opening").hidden) return;
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
  G.terminalOpen = false;
  $("shellshade").hidden = true;
  $("termPrompt").textContent = "operator@bastion:~$";
  $("termTitle").textContent = "operator@bastion — shell";
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
  $("termPrompt").textContent = "operator@bastion:~$";
  $("termTitle").textContent = "operator@bastion — shell";
}
