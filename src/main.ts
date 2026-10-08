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
  "README.md": `# prod-east bastion — investigator's desk

Checkout is still working. Rhea observed unexpected payment-api egress.
Find what changed, explain how it happened, and protect customers while you investigate.

Start with the evidence, not a guessed culprit:
  cat case/assignment.txt
  oc whoami
  oc project
  oc get pods -A
  oc project payments
  oc logs deployment/payment-api
  oc get deployment/payment-api -o yaml | less

Meet Mira in the cluster lobby for worker-room access. Interview Kai in Operations.
The RHACS maintenance locker holds the keycard for Vale's records archive.
Witness leads and your notebook travel with you; return here to test them.

Useful places to look:
  case/       incident records and release evidence
  audit/      retained API audit events
  policies/   candidate egress policies; read their dependencies before applying
  campaign/   the current chapter's briefing and evidence

TAB completes files and commands; Up/Down recalls history. Use cd, ls and cat to
explore. Pipe long output to less (q quits, / searches). Notes save locally.
case status shows what your current investigation still needs.

Cluster/API reference: cat docs/cluster-guide.md | less
Optional practice manifests: cat lab.txt
This desk connects to the same offline training cluster throughout the journey.
`,
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
