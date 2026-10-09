import { S } from "../simulation/state.js";
import { currentChapter, campaignChecks, chapterRoot } from "./engine.js";
import { chapterQuestion } from "./questions.js";
import type { NextAction } from "../missions/guidance.js";

export function campaignNextAction(): NextAction {
  const chapter = currentChapter(),
    witness = chapter.witnesses.find((w) => !S.campaign.interviews.includes(w.who));
  if (witness) return { title: "Interview " + witness.who.toUpperCase(), detail: `Meet ${witness.who.toUpperCase()} in ${witness.scene}. Their interview is still missing from this case. It will add the record commands to your notebook.`, commands: [] };
  if (!S.campaign.artifactFound) return { title: "Find the case dossier", detail: `Search ${chapter.artifact.title} in the archive. Its manifests and command plan will be saved in Case file. The maintenance locker at RHACS Central contains the archive keycard.`, commands: [] };
  const record = ["briefing.txt", "evidence.json", "handover.txt"].find((name) => !S.campaign.evidence.includes(name));
  if (record) return { title: "Read " + record, detail: "The interviews and dossier are recorded. Read the remaining case record at the bastion. Your command is saved in Case file.", commands: ["cat ~/" + chapterRoot() + record] };
  const checks = campaignChecks(),
    missing = checks.find((check) => !check.passed);
  if (!missing) return { title: "Submit your case answer", detail: "All resource and verification checks passed. Open Case file and submit the answer to: " + chapterQuestion(chapter).question, commands: [chapterQuestion(chapter).command] };
  const goal = chapter.goals.find((goal) => goal.label === missing.label);
  if (goal) {
    if (chapter.id === "04" && goal.value === undefined && !S.campaign.diagnostics[chapter.namespace])
      return { title: "Preserve the failed Pod's diagnosis", detail: "Capture the runtime failure before deleting broken. The diagnostic test retains the observation for this case.", commands: ["oc logs broken -n " + chapter.namespace, "case test diagnose"] };
    const file = Object.entries(chapter.files).find(([, object]) => typeof object === "object" && (object.kind === goal.kind && object.metadata.name === goal.name || goal.kind === "Pod" && object.kind === "Deployment" && goal.name === object.metadata.name + "-sim-0"))?.[0],
      namespace = goal.namespace ?? chapter.namespace;
    return {
      title: missing.label,
      detail: "The case records are reviewed. This resource goal is still unmet. Inspect the current object and use the dossier's saved resource-change commands; apply its prerequisites before its consumer. Cluster-scoped controls and Role/RoleBinding changes need the administrator credential from the sealed archive cabinet.",
      commands: goal.value === undefined
        ? ["oc delete " + goal.kind.toLowerCase() + " " + goal.name + " -n " + namespace]
        : [...(file ? ["cat ~/" + chapterRoot() + file] : []), "oc get " + goal.kind.toLowerCase() + " " + goal.name + " -n " + namespace + " -o yaml"],
    };
  }
  const probe = chapter.probes.find((probe) => missing.label.endsWith("case test " + probe.id));
  return { title: missing.label, detail: "The resource goals are met. Run this verification after your final change. If it fails, its output names the remaining problem; repair that condition and repeat the check. Earlier proof expires when resources change.", commands: probe ? ["case test " + probe.id] : ["case status"] };
}
