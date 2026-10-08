import { C, G } from "../game/runtime.js";
import { approachObject } from "../game/movement.js";
import type { PlacedLabel } from "./label-layout.js";
import type { WorldObject } from "./locations.js";

const layer = document.createElement("div");
layer.className = "worldTargets";
layer.setAttribute("role", "group");
layer.setAttribute("aria-label", "Scene destinations and witnesses");
C.after(layer);
const targets = new Map<
  string,
  { button: HTMLButtonElement; object: WorldObject }
>();

/** Labels are controls at their painted position, even when layout moves them. */
export function syncInteractionTargets(labels: PlacedLabel[]) {
  const shown = new Set(labels.map((label) => label.object.id));
  const bounds = C.getBoundingClientRect();
  layer.hidden =
    !document.getElementById("opening")!.hidden ||
    !labels.length ||
    G.terminalOpen ||
    G.detailOpen ||
    G.endOpen ||
    G.caseOpen ||
    G.radioOpen;
  for (const [id, target] of targets) target.button.hidden = !shown.has(id);
  for (const label of labels) {
    const id = label.object.id;
    let target = targets.get(id);
    if (!target) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.worldTarget = id;
      target = { button, object: label.object };
      targets.set(id, target);
      button.addEventListener("click", () => approachObject(target!.object));
      layer.append(button);
    }
    target.object = label.object;
    const button = target.button;
    button.hidden = false;
    button.setAttribute(
      "aria-label",
      `${label.object.label}: ${label.object.sub}`,
    );
    button.style.left = `${((label.x - G.cameraX) * bounds.width) / C.width}px`;
    button.style.top = `${((label.y - G.cameraY) * bounds.height) / C.height}px`;
    button.style.width = `${(label.width * bounds.width) / C.width}px`;
    button.style.height = `${(label.height * bounds.height) / C.height}px`;
  }
}
