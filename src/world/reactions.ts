import { S } from "../simulation/state.js";
import { G, reduced } from "../game/runtime.js";
import { closeTerminal } from "../terminal/shell.js";
import { radio } from "../characters/dialogue.js";
import { scheduleSave } from "../simulation/persistence.js";
import type { WorldObject } from "./locations.js";

/** Consequence-driven NPC arrival is presentation; checkout impact stays in simulation. */
export function startMiraReaction() {
  if (S.story.outageSeen || S.policy !== "deny") return;
  closeTerminal();
  G.target = null;
  G.pending = null;
  S.story.mira = { scene: "soc", x: 980, y: 485 };
  G.miraReaction = { x: 980, y: 485, step: 0, arrived: false };
  scheduleSave();
}
export function updateReaction(dt: number) {
  const actor = G.miraReaction;
  if (!actor || actor.arrived || !S.started) return;
  if (S.world.scene !== "soc") {
    G.miraReaction = null;
    return;
  }
  const target = { x: Math.min(1030, S.x + 85), y: Math.min(540, S.y + 35) };
  const distance = Math.hypot(target.x - actor.x, target.y - actor.y);
  if (distance > 5 && !reduced) {
    const stride = Math.min(dt * 350, distance);
    actor.x += ((target.x - actor.x) / distance) * stride;
    actor.y += ((target.y - actor.y) / distance) * stride;
    actor.step += stride / 140;
  } else {
    actor.x = target.x;
    actor.y = target.y;
    actor.arrived = true;
    S.story.outageSeen = true;
    scheduleSave();
    radio(
      "MIRA",
      `What did you do? Checkout is offline! ${S.deployment.readyReplicas}/${S.deployment.desiredReplicas} payment Pods are Ready, but ${[!S.incidentNetwork.dns ? "DNS" : "",!S.incidentNetwork.ledger ? "ledger" : ""].filter(Boolean).join(" and ")} cannot be reached. Stopping the signal cannot cost us the payment service. Go back to the bastion: inspect the targeted egress policy, restore the required paths, then prove both the allowed and blocked connections.`,
    );
  }
  S.story.mira.x = actor.x;
  S.story.mira.y = actor.y;
}
export function reactionObjects(): WorldObject[] {
  // Mira is an ordinary world object with one persisted location.
  return [];
}
