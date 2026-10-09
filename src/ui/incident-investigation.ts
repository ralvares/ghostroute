import { S } from "../simulation/state.js";
import { G } from "../game/runtime.js";
import {
  incidentInvestigation,
  incidentQuestions,
  checkIncidentAnswers,
  missingIncidentEvidence,
  type IncidentAnswers,
} from "../missions/incident-guide.js";
import { explainIncidentAnswers } from "../missions/incident.js";
import { maybeWin } from "../missions/progression.js";
import { scheduleSave } from "../simulation/persistence.js";
import { closeCaseFile, openDetail, closeDetail, showCase } from "./panels.js";
import { esc } from "./notifications.js";

function copyCommand(command: string) {
  return `<div class="notebookCommand"><code>${esc(command)}</code><button type="button" data-copy-command="${esc(command)}" aria-label="Copy command: ${esc(command)}">Copy</button></div>`;
}

export function incidentInvestigationHTML() {
  const steps = incidentInvestigation(S.incident),
    next = steps.find((step) => !step.complete),
    count = steps.filter((step) => step.complete).length;
  return `<section class="incidentInvestigation" aria-labelledby="investigationTitle"><div class="investigationHeading"><h3 id="investigationTitle">Who changed payment-api?</h3><span>${S.incident.explained ? "Solved" : `${count} / 3 records`}</span></div><p>Find three answers: the service account, the release run, and the imported filename. Read the records at the bastion, then submit your answers here. Hints and retries are available.</p><ol class="investigationSteps">${steps.map((step) => `<li class="${step.complete ? "reviewed" : step === next ? "next" : ""}"><span class="investigationMark" aria-hidden="true">${step.complete ? "✓" : "○"}</span><details${step === next ? " open" : ""}><summary>${esc(step.title)}<span class="investigationStatus">${step.complete ? "Reviewed" : step === next ? "Next" : "To review"}</span></summary><p>${esc(step.complete ? step.reviewed : step.instruction)}</p>${copyCommand(step.command)}</details></li>`).join("")}</ol>${S.incident.explained ? '<p class="incidentSolved"><strong>Case answers accepted.</strong> Build-bot executed release-184, which imported support.env without a configuration review. Broad Deployment write access and unrestricted egress let the setting reach the application and its external destination.</p>' : `<button type="button" class="btnquiet investigationAction" id="recordIncidentExplanation">Answer case questions</button><p class="investigationFootnote">${next ? "First read the remaining records using the commands above. You can open the questions now to see exactly what to find." : "All records reviewed. Your answers will record the cause; then finish containment and service checks."}</p>`}</section>`;
}

export function registerIncidentInvestigation() {
  document.getElementById("recordIncidentExplanation")?.addEventListener("click", () => {
    closeCaseFile();
    const missing = missingIncidentEvidence(S.incident);
    openDetail(`<h2>Who changed payment-api?</h2><p>Three answers close the investigation. Use the exact names from the records. Wrong answers do not reset your progress.</p>${missing.length ? `<div class="incidentMissing"><strong>Read ${missing.length} remaining ${missing.length === 1 ? "record" : "records"} at the bastion before submitting.</strong>${missing.map((step) => copyCommand(step.command)).join("")}</div>` : ""}<form id="incidentExplanationForm"><fieldset class="incidentQuestions"><legend>Case 018 answers</legend>${incidentQuestions.map((question, i) => `<div class="incidentQuestion"><label for="incidentAnswer-${question.id}">${i + 1}. ${esc(question.question)}</label><p id="incidentSource-${question.id}" class="incidentQuestionSource">Read <code>${esc(question.source)}</code> · field <code>${esc(question.field)}</code></p><input id="incidentAnswer-${question.id}" name="${question.id}" type="text" required maxlength="256" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="${esc(question.format)}" aria-describedby="incidentSource-${question.id} incidentFeedback-${question.id}"><div class="incidentQuestionHelp"><p id="incidentFeedback-${question.id}" role="status" aria-live="polite"></p><button type="button" data-incident-hint="${question.id}">Show hint</button></div></div>`).join("")}</fieldset><p id="incidentExplanationFeedback" class="incidentExplanationFeedback" role="status" aria-live="polite"></p><button type="submit" class="btnquiet">Submit case answers</button></form>`, "Answers record the cause. Finish the remaining cluster checks to clear this stage.");
    document.querySelectorAll<HTMLButtonElement>("[data-incident-hint]").forEach((button) => {
      let hintShown = false;
      button.addEventListener("click", () => {
        const question = incidentQuestions.find((q) => q.id === button.dataset.incidentHint)!;
        document.getElementById(`incidentFeedback-${question.id}`)!.textContent = hintShown
          ? `Answer: ${question.answer}. Find it in ${question.field} in ${question.source}.`
          : question.hint;
        button.textContent = hintShown ? "Answer shown" : "Show answer";
        button.disabled = hintShown;
        hintShown = true;
      });
    });
    document.getElementById("incidentExplanationForm")!.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget as HTMLFormElement),
        answers = Object.fromEntries(incidentQuestions.map((q) => [q.id, String(data.get(q.id) ?? "")])) as IncidentAnswers,
        checks = checkIncidentAnswers(answers);
      for (const check of checks) {
        const field = document.getElementById(`incidentAnswer-${check.id}`)!;
        field.setAttribute("aria-invalid", String(!check.correct));
        document.getElementById(`incidentFeedback-${check.id}`)!.textContent = check.feedback;
      }
      if (checks.some((check) => !check.correct)) {
        document.getElementById("incidentExplanationFeedback")!.textContent = "Keep the correct answers. Check the hints for the others and try again.";
        document.getElementById(`incidentAnswer-${checks.find((check) => !check.correct)!.id}`)!.focus();
        return;
      }
      try {
        explainIncidentAnswers(answers);
        closeDetail();
        maybeWin();
        scheduleSave();
        if (!G.endOpen) showCase();
      } catch (error) {
        document.getElementById("incidentExplanationFeedback")!.textContent = (error as Error).message;
      }
    });
    document.querySelector<HTMLInputElement>("#incidentExplanationForm input")!.focus();
  });
}
