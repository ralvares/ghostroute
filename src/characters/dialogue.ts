import { S } from "../simulation/state.js";
import { G } from "../game/runtime.js";
import { $ } from "../ui/dom.js";

export function radio(who: string, msg: string) {
  if (!S.started || G.endOpen) return;
  G.radioOpen = true;
  $("radioName").textContent = who;
  $("radioText").textContent = msg;
  $("radioPortrait").replaceChildren();
  const portrait = document.createElement("img");
  portrait.src = `${import.meta.env.BASE_URL}art/${who === "RHEA" ? "rhea" : "mira"}.webp`;
  portrait.alt = "";
  $("radioPortrait").appendChild(portrait);
  $("radio").hidden = false;
  $("nearby").hidden = true;
}

export function closeRadio() {
  G.radioOpen = false;
  $("radio").hidden = true;
}
