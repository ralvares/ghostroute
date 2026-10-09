import { S } from "../simulation/state.js";
import { resolvePath, HOME } from "../simulation/filesystem.js";
import { tokenize } from "../terminal/lexer.js";
import { reviewedIncidentRecords } from "./incident-records.js";
import { checkIncidentAnswers, incidentConclusions, missingIncidentEvidence, type IncidentAnswers } from "./incident-guide.js";

export function observeIncidentCommand(
  raw: string,
  output: string,
  successful: boolean,
) {
  if (!successful) return [];
  const tokens = tokenize(raw),
    values = tokens.map((t) => t.value);
  if (
    ["cat", "jq", "more", "less", "head", "tail", "grep"].includes(values[0])
  ) {
    const paths = tokens
      .filter((t) => t.kind === "word")
      .slice(1)
      .map((t) => resolvePath(t.value));
    if (
      paths.includes(HOME + "/audit/kube-apiserver.log") &&
      output.includes("build-bot") &&
      output.includes("TELEMETRY_ENDPOINT")
    )
      S.incident.auditSeen = true;
    if (
      paths.includes(HOME + "/case/release-job.json") &&
      output.includes("00000000-0000-4000-8000-000000000000") &&
      output.includes("import-support-config")
    )
      S.incident.releaseSeen = true;
    if (
      paths.includes(HOME + "/case/permission-review.yaml") &&
      output.includes("release-bot") &&
      output.includes("patch")
    )
      S.incident.accessSeen = true;
  }
  if (
    values[0] === "oc" &&
    ["get", "describe"].includes(values[1]) &&
    ["role", "roles"].includes(values[2]) &&
    values[3] === "release-bot" &&
    (values.includes("payments") || S.cluster.namespace === "payments") &&
    output.includes("patch")
  )
    S.incident.accessSeen = true;
  return reviewedIncidentRecords(raw, output, S.cluster.cwd);
}
export function explainIncident(finding: string) {
  const missing = missingIncidentEvidence(S.incident);
  if (missing.length)
    throw new Error(
      missing.map((step) => step.instruction + "\n" + step.command).join("\n\n") +
      "\nThen answer the three case questions in Case file or use case explain release-import at the bastion.",
    );
  if (finding !== "release-import")
    throw new Error(
      "That finding does not match the linked request. " +
      (incidentConclusions.find((choice) => choice.id === finding)?.feedback ??
        "Correlate the auditID, delivery step and imported setting."),
    );
  const event = S.cluster.audit.find(
    (e) => e.auditID === "00000000-0000-4000-8000-000000000000",
  );
  if (
    event?.user.username !== "system:serviceaccount:payments:build-bot" ||
    event.responseStatus.code !== 200
  )
    throw new Error("The retained API event does not support this conclusion.");
  S.incident.explained = true;
  return "CAUSE VERIFIED · prod-east\nCaller: system:serviceaccount:payments:build-bot.\nMechanism: delivery run release-184 imported an unreviewed support environment file and patched TELEMETRY_ENDPOINT; its retained response auditID matches the API event.\nWeak links: deployment settings were not reviewed at promotion, the delivery identity could patch any Deployment in payments, and egress had no boundary.\nA human attacker is not established. The matched delivery run explains this change. Next: rebuild the owned replacement and withdraw the bot write grant, then protect the release path.";
}

export function explainIncidentAnswers(answers: IncidentAnswers) {
  const incorrect = checkIncidentAnswers(answers).filter((answer) => !answer.correct);
  if (incorrect.length) throw new Error(incorrect.map((answer) => answer.feedback).join("\n"));
  return explainIncident("release-import");
}
