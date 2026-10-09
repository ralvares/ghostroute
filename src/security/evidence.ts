import { collectEvidence } from "../simulation/operations.js";
import { S } from "../simulation/state.js";
import { $ } from "../ui/dom.js";
import { toast } from "../ui/notifications.js";
import { radio } from "../characters/dialogue.js";
import { updateHUD } from "../ui/hud.js";
import { maybeWin } from "../missions/progression.js";

export const clues = {
  rhacs: {
    name: "Network baseline deviation",
    text: "RHACS observed payment-api → 203.0.113.77:443. This destination is absent from the learned baseline. An anomaly alone does not establish malicious intent.",
  },
  trace: {
    name: "Trace to payment-api",
    text: "The retained trace places the unapproved connection at payment-api Pods on both workers. The source was not the internal ledger service.",
  },
  logs: {
    name: "Application log anomaly",
    text: "The preserved container logs record a telemetry POST to the unapproved endpoint. The request payload and intent are not established by these logs.",
  },
  env: {
    name: "Deployment configuration",
    text: "Before remediation, the payment-api Deployment set TELEMETRY_ENDPOINT=https://203.0.113.77/upload. The snapshot preserves the unexpected application configuration change.",
  },
  policy: {
    name: "Missing egress boundary",
    text: "At the start of the incident, no egress NetworkPolicy selected payment-api. Without egress isolation, an accidental or malicious connection could reach external addresses.",
  },
};

export function addClue(k: ClueId) {
  if (!collectEvidence(k)) return;
  $("evidenceCount").textContent = S.evidence.size + " / 5";
  toast("✦ Evidence discovered: " + clues[k].name);
  if (S.evidence.size === 2 && S.env)
    radio(
      "RHEA",
      "Two independent signals now point at payment-api. Correlate its application logs and Deployment before changing production.",
    );
  updateHUD();
  maybeWin();
}

export type ClueId = keyof typeof clues;
