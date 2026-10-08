import { floorPoint } from "./walkable.js";
import { S } from "../simulation/state.js";
import { G, C, keys } from "../game/runtime.js";
import { $ } from "../ui/dom.js";
import { closeRadio } from "../characters/dialogue.js";
import { scenes, type SceneId } from "./scene-model.js";
import { closeTerminal } from "../terminal/shell.js";
import { canEnterWorker, canEnterArchive } from "./story.js";
import { toast } from "../ui/notifications.js";
import { updateHUD } from "../ui/hud.js";
import { scheduleSave } from "../simulation/persistence.js";
import { currentChapter } from "../campaign/engine.js";
export function enterScene(scene: SceneId) {
  if (!S.started || G.endOpen || (G.miraReaction && !G.miraReaction.arrived))
    return;
  if (scene === "archive" && !canEnterArchive(S)) {
    toast(
      "Records archive locked · find the maintenance keycard at RHACS Central.",
    );
    return;
  }
  if (scene.startsWith("worker") && !canEnterWorker(S)) {
    toast(
      "Worker access required · bring Rhea’s incident report to Mira in the lobby.",
    );
    return;
  }
  closeTerminal();
  const previous = S.world.scene;
  S.world.scene = scene;
  if (!S.world.visited.includes(scene)) S.world.visited.push(scene);
  const spawn = scenes[scene].spawn;
  S.x = spawn.x;
  S.y = spawn.y;
  if (previous === "soc" && scene === "district") {
    S.x = 270;
    S.y = 380;
  }
  if (previous === "external" && scene === "district") {
    S.x = 950;
    S.y = 500;
  }
  if (previous === "cluster" && scene === "district") {
    S.x = 820;
    S.y = 370;
  }
  if (previous.startsWith("worker") && scene === "cluster") {
    S.x = previous === "worker-01" ? 440 : 830;
    S.y = 360;
  }
  const safe = floorPoint({ x: S.x, y: S.y }, scene);
  S.x = safe.x;
  S.y = safe.y;
  G.target = null;
  G.pending = null;
  G.near = null;
  G.traceOn = false;
  G.walking = false;
  keys.clear();
  closeRadio();
  $("nearby").hidden = true;
  updateSceneHUD();
  updateHUD();
  C.focus();
  scheduleSave();
}
export function updateSceneHUD() {
  const scene = scenes[S.world.scene];
  const chapter = S.campaign.active ? currentChapter() : null;
  const title = chapter
    ? S.world.scene === "district"
      ? chapter.district + " · security district"
      : scene.title.replace(
          "prod-east",
          chapter.district + " / " + chapter.namespace,
        )
    : scene.title;
  const description = chapter
    ? "Chapter " +
      chapter.id +
      " · " +
      chapter.title +
      " · " +
      (S.world.scene.startsWith("worker")
        ? "Scheduled tenant Pods and field evidence"
        : scene.description)
    : scene.description;
  C.dataset.scene = S.world.scene;
  document.getElementById("sceneTitle")!.textContent = title;
  document.getElementById("sceneDescription")!.textContent = description;
  const back = document.getElementById("sceneBack")!;
  back.hidden = !scene.parent;
  back.textContent =
    scene.parent === "district"
      ? "Return to district"
      : "Return to cluster lobby";
  const badge = document.getElementById("zoneBadge")!;
  badge.textContent =
    S.world.scene === "soc"
      ? "TRUSTED OPERATOR HUB"
      : S.world.scene === "external"
        ? "UNTRUSTED NETWORK"
        : S.world.scene === "district"
          ? "PUBLIC TRANSIT"
          : "RESTRICTED CLUSTER";
  badge.className =
    "zoneBadge " +
    (S.world.scene === "soc"
      ? "trusted"
      : S.world.scene === "external"
        ? "untrusted"
        : "neutral");
  C.setAttribute(
    "aria-label",
    `Interactive RPG map: ${title}. ${description} Click a character, computer or doorway to walk and interact. WASD moves; E interacts.`,
  );
}
export function registerScenes() {
  document.getElementById("sceneBack")!.addEventListener("click", () => {
    const parent = scenes[S.world.scene].parent;
    if (parent && !G.detailOpen && !G.caseOpen && !G.endOpen)
      enterScene(parent);
  });
  updateSceneHUD();
}
