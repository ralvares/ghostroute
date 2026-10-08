import { subscribe } from "../simulation/events.js";
import { updateHUD } from "./hud.js";
import { radio } from "../characters/dialogue.js";
import { S } from "../simulation/state.js";

/** Views reread the same store after domain changes; no private resource copies. */
export function registerSimulationViews() {
  return subscribe((event) => {
    if (
      event.type === "security.reevaluated" ||
      event.type === "evidence.collected" ||
      event.type === "simulation.reset"
    )
      updateHUD();
    if (event.type === "policy.applied" && event.data.outageStarted) {
      const incident = S;
      setTimeout(() => {
        if (S === incident && S.policy === "deny")
          radio(
            "MIRA",
            "Your default-deny policy stopped the suspicious path, but it also cut off DNS and the ledger dependency. That is why we test legitimate traffic before calling a fix complete.",
          );
      }, 500);
    }
  });
}
