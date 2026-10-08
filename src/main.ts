import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/inter/latin-800.css";
import "./ui/styles.css";
import { registerHealthMap } from "./ui/health-map.js";
import { registerScenes } from "./world/scenes.js";
import { registerWorkbench } from "./ui/workbench.js";
import { registerControls } from "./game/controls.js";
import { loop } from "./game/rendering.js";
import { updateHUD } from "./ui/hud.js";
import { registerSimulationViews } from "./ui/simulation-views.js";
import { registerAuditBridge } from "./security/audit-bridge.js";
import { loadProgress, registerPersistence } from "./simulation/persistence.js";
import { S } from "./simulation/state.js";
import { $ } from "./ui/dom.js";
import { G } from "./game/runtime.js";
import { showEnding } from "./missions/progression.js";
import { registerOffline } from "./game/offline.js";
import { switchPrompt } from "./terminal/shell.js";

import { storyFiles } from "./missions/story.js";
import clusterGuide from "../CLUSTER_GUIDE.md?raw";
import { registerDocuments } from "./simulation/filesystem.js";
import { registerCampaignFiles } from "./campaign/engine.js";
import { showCampaignEnding } from "./ui/campaign.js";
registerCampaignFiles();
registerDocuments({
  "README.md": clusterGuide,
  "docs/cluster-guide.md": clusterGuide,
  ...storyFiles,
});
import { loadArtwork } from "./game/artwork.js";
await Promise.all([loadProgress(), loadArtwork()]);
registerSimulationViews();
registerAuditBridge();
registerPersistence();
registerControls();
registerScenes();
registerWorkbench();
registerHealthMap();
new ResizeObserver(([entry]) =>
  document.documentElement.style.setProperty(
    "--header-height",
    `${entry.borderBoxSize[0].blockSize}px`,
  ),
).observe(document.querySelector(".top")!);
if (S.started) {
  switchPrompt();
  $("startBtn").textContent = "Resume the case →";
  $("evidenceCount").textContent = `${S.evidence.size} / 5`;
}
if (S.campaign.active && S.campaign.completed.includes(S.campaign.active)) {
  $("opening").hidden = true;
  G.active = true;
  showCampaignEnding();
} else if (S.done && !S.campaign.active) {
  $("opening").hidden = true;
  G.active = true;
  showEnding();
}
updateHUD();
$("startBtn").disabled = false;
document.documentElement.dataset.ready = "true";
requestAnimationFrame(loop);
void registerOffline();
