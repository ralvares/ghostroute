import { S } from "../simulation/state.js";
import { G } from "../game/runtime.js";
import { $ } from "../ui/dom.js";

export function radio(who: string, msg: string) {
  if (!S.started || G.terminalOpen || G.endOpen) return;
  G.radioOpen = true;
  $("radioName").textContent = who;
  $("radioText").textContent = msg;
  $("radioPortrait").textContent = who === "RHEA" ? "🛡️" : "👩🏽‍💻";
  $("radio").hidden = false;
  $("nearby").hidden = true;
}

export function closeRadio() {
  G.radioOpen = false;
  $("radio").hidden = true;
}
