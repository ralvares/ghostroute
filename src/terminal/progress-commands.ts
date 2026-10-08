import { progressStatus, saveProgress } from "../simulation/persistence.js";
import { offlineStatus } from "../game/offline.js";
import { updateSceneHUD } from "../world/scenes.js";
import { S, replaceState } from "../simulation/state.js";
import { encodeProgress, decodeProgress } from "../simulation/snapshot.js";
import { print, printError, closeTerminal, switchPrompt } from "./shell.js";
import { G } from "../game/runtime.js";
import { $ } from "../ui/dom.js";
import { updateHUD } from "../ui/hud.js";
import { showEnding } from "../missions/progression.js";
import { closeRadio } from "../characters/dialogue.js";
import { closeDetail } from "../ui/panels.js";

export async function progressCommand(raw: string) {
  if (!raw.startsWith("game ")) return false;
  if (raw === "game status") {
    print(
      `Local progress: ${progressStatus.state}${progressStatus.savedAt ? " · " + progressStatus.savedAt : ""}\nOffline installation: ${offlineStatus.state}\n${progressStatus.error || offlineStatus.error || "Progress stays in this browser. Use game export for a portable backup."}`,
    );
  } else if (raw === "game save") {
    await saveProgress();
    (progressStatus.state === "saved" ? print : printError)(
      progressStatus.state === "saved"
        ? "Progress saved locally."
        : progressStatus.error,
    );
  } else if (raw === "game export") {
    const url = URL.createObjectURL(
      new Blob([encodeProgress(S)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "roadshow-progress.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    print(
      "Downloaded roadshow-progress.json. Keep it to restore progress in another browser.",
    );
  } else if (raw === "game import") {
    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = ".json,application/json";
    picker.hidden = true;
    document.body.appendChild(picker);
    picker.oncancel = () => picker.remove();
    picker.onchange = async () => {
      try {
        const file = picker.files?.[0];
        if (!file) return;
        if (file.size > 20_000_000)
          throw new Error("Progress file is too large (20 MB limit).");
        const restored = decodeProgress(await file.text());
        replaceState(restored);
        G.target = null;
        G.pending = null;
        G.traceOn = false;
        G.caseOpen = false;
        G.endOpen = false;
        $("casepanel").hidden = true;
        $("ending").hidden = true;
        closeRadio();
        closeDetail();
        closeTerminal();
        switchPrompt();
        G.active = false;
        $("termOutput").textContent = "";
        $("opening").hidden = false;
        $("startBtn").textContent = S.started
          ? "Resume the case →"
          : "Enter the cluster →";
        $("evidenceCount").textContent = `${S.evidence.size} / 5`;
        updateSceneHUD();
        updateHUD();
        if (S.done) {
          $("opening").hidden = true;
          G.active = true;
          showEnding();
        }
        await saveProgress();
      } catch (error) {
        printError(`Import failed: ${(error as Error).message}`);
      } finally {
        picker.remove();
      }
    };
    picker.click();
    print(
      "Choose a ROADSHOW progress file. Import replaces the current local save.",
    );
  } else {
    printError(
      "Unknown game command. Use game status, game save, game export or game import.",
    );
  }
  return true;
}
