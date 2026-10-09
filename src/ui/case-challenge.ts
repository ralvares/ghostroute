import { currentChapter, campaignChecks, concludeCampaignAnswer } from "../campaign/engine.js";
import { chapterQuestion, checkChapterAnswer } from "../campaign/questions.js";
import { collectedCommands } from "../missions/command-leads.js";
import { S } from "../simulation/state.js";
import { esc } from "./notifications.js";
import { showCampaignEnding } from "./campaign.js";
import { campaignNextAction } from "../campaign/guidance.js";

export function campaignChallengeHTML() {
  const chapter = currentChapter(),
    question = chapterQuestion(chapter),
    checks = campaignChecks(),
    next = campaignNextAction();
  return `<div class="eyebrow">Chapter ${chapter.id} · ${esc(chapter.namespace)}</div><h2>${esc(chapter.title)}</h2><p>${esc(chapter.hook)}</p><section class="witnessNext"><h3>Next: ${esc(next.title)}</h3><p>${esc(next.detail)}</p>${next.commands.map((command) => `<div class="notebookCommand"><code>${esc(command)}</code><button type="button" data-copy-command="${esc(command)}" aria-label="Copy command: ${esc(command)}">Copy</button></div>`).join("")}</section><form id="campaignAnswerForm"><fieldset class="incidentQuestions"><legend>Your case question</legend><div class="incidentQuestion"><label for="campaignAnswer">${esc(question.question)}</label><p id="campaignAnswerSource" class="incidentQuestionSource">Read <code>~/campaign/${chapter.id}/${esc(question.file)}</code> · field <code>${esc(question.field)}</code></p><div class="notebookCommand"><code>${esc(question.command)}</code><button type="button" data-copy-command="${esc(question.command)}" aria-label="Copy command: ${esc(question.command)}">Copy</button></div><input id="campaignAnswer" name="answer" type="text" required maxlength="512" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="${esc(question.format)}" aria-describedby="campaignAnswerSource campaignAnswerHint"><div class="incidentQuestionHelp"><p id="campaignAnswerHint" role="status" aria-live="polite"></p><button type="button" id="campaignAnswerHelp">Show hint</button></div></div></fieldset><p id="campaignAnswerFeedback" class="incidentExplanationFeedback" role="status" aria-live="polite"></p><button type="submit" class="btnquiet">Submit answer and close case</button><p class="investigationFootnote">Wrong answers can be retried. Your answer closes the case after the checks below pass.</p></form><details class="campaignCheckList" open><summary>Completion checks · ${checks.filter((check) => check.passed).length} / ${checks.length}</summary><ul class="chapterChecks">${checks.map((check) => `<li class="${check.passed ? "good" : ""}">${check.passed ? "✓ " : "○ "}${esc(check.label)}</li>`).join("")}</ul></details><details class="campaignCheckList"><summary>Commands from your collected leads</summary>${collectedCommands(S).map((lead) => `<h3>${esc(lead.source)}</h3><p>${esc(lead.purpose)}</p>${lead.commands.map((command) => `<div class="notebookCommand"><code>${esc(command)}</code><button type="button" data-copy-command="${esc(command)}" aria-label="Copy command: ${esc(command)}">Copy</button></div>`).join("")}`).join("") || "<p>Interview the witnesses and search the archive to collect your command plan.</p>"}</details><p class="caseRisk">${esc(chapter.risk)}</p>`;
}

export function registerCampaignChallenge() {
  const chapter = currentChapter(),
    question = chapterQuestion(chapter);
  let hintShown = false;
  document.getElementById("campaignAnswerHelp")!.addEventListener("click", (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    document.getElementById("campaignAnswerHint")!.textContent = hintShown
      ? `Answer: ${question.answer}. Find it in ${question.field} in ${question.file}.`
      : question.hint;
    button.textContent = hintShown ? "Answer shown" : "Show answer";
    button.disabled = hintShown;
    hintShown = true;
  });
  document.getElementById("campaignAnswerForm")!.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("campaignAnswer") as HTMLInputElement,
      check = checkChapterAnswer(chapter, input.value),
      feedback = document.getElementById("campaignAnswerFeedback")!;
    input.setAttribute("aria-invalid", String(!check.correct));
    if (!check.correct) {
      feedback.textContent = check.feedback + " You can retry or use Show hint.";
      input.focus();
      return;
    }
    try {
      concludeCampaignAnswer(input.value);
      showCampaignEnding();
    } catch (error) {
      feedback.textContent = "Your answer is correct. " + (error as Error).message;
    }
  });
}
