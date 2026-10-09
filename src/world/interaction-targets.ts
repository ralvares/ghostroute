import { C, G } from "../game/runtime.js";
import { approachObject } from "../game/movement.js";
import type { PlacedLabel } from "./label-layout.js";
import type { WorldObject } from "./locations.js";
import { S } from "../simulation/state.js";
import { doorMarkerState } from "./door-markers.js";

const layer = document.createElement("div");
layer.className = "worldTargets";
layer.setAttribute("role", "group");
layer.setAttribute("aria-label", "Scene destinations and witnesses");
C.after(layer);
const targets = new Map<
  string,
  { button: HTMLButtonElement; object: WorldObject }
>();

/** Browser text stays sharp at display density; its control is the visible label. */
export function syncInteractionTargets(labels: PlacedLabel[]) {
  const shown = new Set(labels.map((label) => label.object.id));
  const bounds = C.getBoundingClientRect();
  layer.hidden = !labels.length;
  layer.inert =
    !document.getElementById("opening")!.hidden ||
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
    button.dataset.markerState = doorMarkerState(
      Math.hypot(S.x - label.object.x, S.y - label.object.y),
      !!G.markerObjectives[id],
    );
    button.dataset.objective = String(G.markerObjectives[id]?.number ?? "");
    const onRing =
      label.object.kind === "portal" &&
      button.dataset.markerState === "on-ring";
    const objective = G.markerObjectives[id];
    button.dataset.highlighted = String(onRing || !!objective?.current);
    button.dataset.compact = String(label.compact);
    const stamp = JSON.stringify([
      label.object.label,
      label.object.sub,
      onRing,
      objective?.number,
      label.compact,
    ]);
    if (button.dataset.textStamp !== stamp) {
      button.dataset.textStamp = stamp;
      button.replaceChildren();
      if (onRing || objective) {
        const badge = document.createElement("span");
        badge.className = "worldLabelBadge";
        badge.textContent = onRing ? "E" : String(objective!.number);
        button.append(badge);
      }
      const text = document.createElement("span");
      text.className = "worldLabelText";
      const title = document.createElement("strong");
      title.textContent = (onRing ? "Enter " : "") + label.object.label;
      text.append(title);
      if (!label.compact) {
        const subtitle = document.createElement("small");
        subtitle.textContent = label.object.sub;
        text.append(subtitle);
      }
      button.append(text);
    }
    button.setAttribute(
      "aria-label",
      `${label.object.label}: ${label.object.sub}`,
    );
    button.style.left = `${Math.round(((label.x - G.cameraX) * bounds.width) / C.width)}px`;
    button.style.top = `${Math.round(((label.y - G.cameraY) * bounds.height) / C.height)}px`;
    button.style.width = `${(label.width * bounds.width) / C.width}px`;
    button.style.height = `${(label.height * bounds.height) / C.height}px`;
  }
}
