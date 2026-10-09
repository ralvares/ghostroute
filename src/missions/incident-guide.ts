import type { SimulationState } from "../simulation/state.js";

type Incident = SimulationState["incident"];

export const incidentQuestions = [
  {
    id: "caller",
    question: "Which service account patched payment-api?",
    format: "Service account name",
    source: "~/audit/kube-apiserver.log",
    field: "user.username",
    answer: "build-bot",
    hint: "Find the payment-api patch. The service account name is the last part of user.username, after the final colon.",
  },
  {
    id: "run",
    question: "Which release run made that patch?",
    format: "Release run name",
    source: "~/case/release-job.json",
    field: "run",
    answer: "release-184",
    hint: "Read the run field in the release record. Its response.auditID matches the audit request.",
  },
  {
    id: "input",
    question: "Which file supplied the telemetry setting?",
    format: "Environment filename",
    source: "~/case/release-job.json",
    field: "input",
    answer: "support.env",
    hint: "Read the input field in the release record. This is the file imported by the release step.",
  },
] as const;

export type IncidentAnswers = Record<typeof incidentQuestions[number]["id"], string>;

export function checkIncidentAnswers(answers: IncidentAnswers) {
  return incidentQuestions.map((question) => {
    const value = (answers[question.id] ?? "").trim().toLowerCase(),
      correct = value === question.answer ||
        (question.id === "caller" && value === "system:serviceaccount:payments:build-bot");
    return { id: question.id, correct, feedback: correct ? "Correct." : "Not quite. " + question.hint };
  });
}

export function incidentInvestigation(incident: Incident) {
  return [
    {
      id: "audit",
      title: "Who made the change?",
      complete: incident.auditSeen,
      instruction: "Read the audit request. Find the caller, TELEMETRY_ENDPOINT and auditID.",
      reviewed: "The audit records a successful Deployment patch by build-bot.",
      command: "cat ~/audit/kube-apiserver.log",
    },
    {
      id: "release",
      title: "Which release made the change?",
      complete: incident.releaseSeen,
      instruction: "Read the run and input fields. They answer which release made the patch and which file supplied the setting. response.auditID links this job to the audit request.",
      reviewed: "Release record reviewed. Its response.auditID links release-184 to the patch; inspect input and reviewedAtPromotion.",
      command: "cat ~/case/release-job.json",
    },
    {
      id: "access",
      title: "Why was the change allowed?",
      complete: incident.accessSeen,
      instruction: "Read the permission review. Which Deployment writes could build-bot make, and were they restricted to one resource?",
      reviewed: "Permission review complete. The release-bot Role allowed Deployment patch/update without a resourceNames restriction.",
      command: "cat ~/case/permission-review.yaml",
    },
  ];
}

export const incidentConclusions = [
  {
    id: "stolen-token",
    label: "A stolen build-bot token let a human attacker patch the Deployment.",
    feedback: "The audit identifies the API caller, but does not establish token theft or a human attacker. Check which release step produced the matching auditID.",
  },
  {
    id: "release-import",
    label: "The release job imported unreviewed telemetry settings and patched the Deployment through build-bot’s broad write permissions.",
    feedback: "",
  },
  {
    id: "image-change",
    label: "The approved container image introduced the external telemetry destination.",
    feedback: "The retained request changes the Deployment environment. Compare that patch with the release input; the records do not attribute this setting to the image.",
  },
] as const;

export function missingIncidentEvidence(incident: Incident) {
  return incidentInvestigation(incident).filter((step) => !step.complete);
}

export function incidentHint(incident: Incident) {
  if (incident.explained)
    return "Cause recorded: release-184 imported unreviewed telemetry settings through build-bot’s broad Deployment write grant. Follow the current next case step above for any remaining fixes or verification. Case file retains your reviewed records and commands.";
  const missing = missingIncidentEvidence(incident);
  if (missing.length)
    return (
      "Next: " + missing[0].title + "\n" +
      missing.map((step) => step.instruction + "\n" + step.command).join("\n\n") +
      "\n\nYour three case answers: the service account name (audit user.username), the release run (release record run), and the imported file (release record input). Open Case file and choose Answer case questions. Incorrect answers can be retried; hints are available."
    );
  return "All three records are reviewed. Open Case file and choose Answer case questions. Enter the service account name, release run and imported filename; each question names its source field. You can also record the supported finding at the bastion:\ncase explain release-import";
}
