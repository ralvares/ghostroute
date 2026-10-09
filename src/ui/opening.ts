import { S } from "../simulation/state.js";
import { currentChapter } from "../campaign/engine.js";
import { chapterQuestion } from "../campaign/questions.js";
import { campaignNextAction } from "../campaign/guidance.js";

const selectors = [".eyebrow", "h2", ".bigquote", ".bigquote + p", ".modal-foot .hint"];
let initial: string[] | undefined;

/** Resume describes the saved chapter; reset restores the original story opening. */
export function updateOpeningBriefing() {
  const opening = document.getElementById("opening")!,
    fields = selectors.map((selector) => opening.querySelector<HTMLElement>(selector)!);
  initial ??= fields.map((field) => field.innerHTML);
  if (!S.campaign.active) {
    fields.forEach((field, index) => { field.innerHTML = initial![index]; });
    return;
  }
  const chapter = currentChapter(), next = campaignNextAction();
  [
    `Chapter ${chapter.id} · prod-east · ${chapter.namespace}`,
    chapter.title,
    chapter.hook,
    "Next: " + next.title + ". " + next.detail,
    "Your case question: " + chapterQuestion(chapter).question + " Open Case file for its source and hints.",
  ].forEach((text, index) => { fields[index].textContent = text; });
}
