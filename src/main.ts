import "./ui/styles.css";
import { registerControls } from "./game/controls.js";
import { loop } from "./game/rendering.js";
import { updateHUD } from "./ui/hud.js";
import { registerSimulationViews } from "./ui/simulation-views.js";

registerSimulationViews();
registerControls();
updateHUD();
requestAnimationFrame(loop);
