import type { SimulationState } from "../simulation/state.js";
import { missingIncidentEvidence } from "./incident-guide.js";

export interface NextAction { title: string; detail: string; commands: string[]; }

/** Guidance describes the remaining condition, not the last action the player took. */
export function incidentNextAction(state: SimulationState): NextAction {
  if (state.done) return { title: "Case complete", detail: "The cause is recorded, checkout works and external egress is blocked. Continue the journey from the debrief.", commands: [] };
  if (state.policy === "deny") return {
    title: "Restore checkout's required dependencies",
    detail: `${[!state.incidentNetwork.dns ? "DNS" : "", !state.incidentNetwork.ledger ? "ledger" : ""].filter(Boolean).join(" and ")} ${!state.incidentNetwork.dns && !state.incidentNetwork.ledger ? "are" : "is"} blocked. Keep the external destination blocked and add the intended DNS/ledger allowances. Read payments-egress.yaml before applying it.`,
    commands: ["cat ~/policies/payments-egress.yaml", "oc apply -f ~/policies/payments-egress.yaml -n payments"],
  };
  if (state.env) return state.evidence.size < 2 ? {
    title: "Find the setting behind the external connection",
    detail: "At the bastion beside me, read payment-api's logs and Deployment. Look for TELEMETRY_ENDPOINT pointing to 203.0.113.77. Both reads add evidence to Case file.",
    commands: ["oc logs deployment/payment-api -n payments", "oc get deployment payment-api -n payments -o yaml"],
  } : {
    title: "Remove the unexpected telemetry setting",
    detail: `${state.policy === "allow" ? "Your egress policy already blocks the external destination and preserves DNS/ledger. " : "The external connection comes from a Deployment environment setting. "}TELEMETRY_ENDPOINT is still present. Remove it from payment-api; the network policy does not remove application configuration.`,
    commands: ["oc set env deployment/payment-api -n payments TELEMETRY_ENDPOINT-"],
  };
  if (state.policy === "none") return {
    title: "Restrict the remaining open egress path",
    detail: "The telemetry setting is removed, but payment-api can still reach the external address. The intended policy allows DNS and ledger while excluding that destination. Read and apply payments-egress.yaml.",
    commands: ["cat ~/policies/payments-egress.yaml", "oc apply -f ~/policies/payments-egress.yaml -n payments"],
  };
  if (!state.incident.explained) {
    const next = missingIncidentEvidence(state.incident)[0];
    return next ? {
      title: next.title,
      detail: "The telemetry setting is removed and egress is restricted. The remaining task is to explain how the change happened. " + next.instruction + " Your command is saved in Case file.",
      commands: [next.command],
    } : { title: "Submit the three case answers", detail: "Your configuration and egress fixes are in place, and the three cause records are reviewed. Open Case file, choose Answer case questions, and enter the service account, release run and imported filename. Use the question hints if needed.", commands: [] };
  }
  if (!(state.evidence.has("rhacs") || state.evidence.has("trace")) || state.evidence.size < 3) return {
    title: "Review the retained incident evidence",
    detail: "The cause and fixes are recorded. Review at least three incident records, including the RHACS observation or network trace. Open the Case file folders; fixes do not erase them.",
    commands: ["cat ~/case/incident-018/README.md", "cat ~/case/incident-018/rhacs-observation.json"],
  };
  if (!state.checked.has("rollout")) return { title: "Verify the payment rollout", detail: "The cause and controls are complete. Confirm the replacement payment Pods finished their rollout.", commands: ["oc rollout status deployment/payment-api -n payments"] };
  if (!state.checked.has("positive")) return { title: "Prove that checkout can reach ledger", detail: "The rollout is verified. From a payment Pod, test the allowed ledger path. Expect HTTP 200; Ready Pods alone do not prove connectivity.", commands: ["oc exec deployment/payment-api -n payments -- curl -I http://ledger:8443/health"] };
  if (!state.checked.has("negative")) return { title: "Prove that the external destination is blocked", detail: "Ledger access is verified. From a payment Pod, test the unapproved destination. A timeout is the expected successful security check.", commands: ["oc exec deployment/payment-api -n payments -- curl -I https://203.0.113.77/upload"] };
  return { title: "Review the case completion", detail: "All required cause, configuration, egress and connection checks are complete. Review Case file and the debrief.", commands: [] };
}
