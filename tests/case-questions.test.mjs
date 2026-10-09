import test from "node:test";
import assert from "node:assert/strict";
import { parse } from "yaml";
import { resetState, S } from "../.test-build/src/simulation/state.js";
import { chapters } from "../.test-build/src/campaign/catalog.js";
import { chapterQuestion, checkChapterAnswer } from "../.test-build/src/campaign/questions.js";
import { registerCampaignFiles, concludeCampaignAnswer } from "../.test-build/src/campaign/engine.js";
import { readVirtualFile } from "../.test-build/src/simulation/filesystem.js";
import { incidentQuestions, checkIncidentAnswers, incidentHint } from "../.test-build/src/missions/incident-guide.js";
import { explainIncidentAnswers, observeIncidentCommand } from "../.test-build/src/missions/incident.js";
import { incidentFiles } from "../.test-build/src/missions/story.js";

const validIncident = { caller: "build-bot", run: "release-184", input: "support.env" };

test("all 27 chapters have answerable questions with a real retained source and explicit field", () => {
  resetState();
  registerCampaignFiles();
  assert.equal(incidentQuestions.length, 3);
  for (const chapter of chapters.slice(1)) {
    const question = chapterQuestion(chapter);
    const path = `/home/operator/campaign/${chapter.id}/${question.file}`;
    const object = parse(readVirtualFile(path));
    const value = question.field.split(".").reduce((current, field) => current?.[field], object);
    assert.equal(String(value), question.answer, `${chapter.id} question must match the shipped source`);
    assert.ok(question.hint && question.format && question.question.endsWith("?"));
    assert.equal(checkChapterAnswer(chapter, "incorrect").correct, false);
    assert.equal(checkChapterAnswer(chapter, "").correct, false);
    assert.equal(checkChapterAnswer(chapter, `  ${question.answer}  `).correct, true);
    assert.match(readVirtualFile(`/home/operator/campaign/${chapter.id}/briefing.txt`), /CASE QUESTION:/);
  }
});

test("wrong answers and correct answers without required proof cannot close a chapter", () => {
  resetState();
  S.campaign.active = 1;
  const before = JSON.stringify(S.campaign);
  assert.throws(() => concludeCampaignAnswer("incorrect"), /Not quite/);
  assert.equal(JSON.stringify(S.campaign), before);
  assert.throws(() => concludeCampaignAnswer(chapterQuestion(chapters[1]).answer), /Case remains open/);
  assert.equal(JSON.stringify(S.campaign), before);
});

test("incident questions accept a service account name or its full identity and give per-field feedback", () => {
  assert.ok(checkIncidentAnswers(validIncident).every((answer) => answer.correct));
  assert.ok(checkIncidentAnswers({ ...validIncident, caller: " system:serviceaccount:payments:build-bot " }).every((answer) => answer.correct));
  const checks = checkIncidentAnswers({ ...validIncident, run: "release-183" });
  assert.equal(checks.find((answer) => answer.id === "caller").correct, true);
  assert.equal(checks.find((answer) => answer.id === "input").correct, true);
  assert.match(checks.find((answer) => answer.id === "run").feedback, /run field/);
  assert.equal(checkIncidentAnswers({ ...validIncident, caller: "system:serviceaccount:other:build-bot" })[0].correct, false);
});

test("incident answer submission preserves progress on failure and uses the same evidence gate as the terminal", () => {
  resetState();
  assert.throws(() => explainIncidentAnswers(validIncident), /Read the audit/);
  assert.equal(S.incident.explained, false);
  observeIncidentCommand("cat ~/audit/kube-apiserver.log", JSON.stringify(S.cluster.audit[0]), true);
  assert.doesNotMatch(incidentHint(S.incident), /Next: Who made/);
  assert.match(incidentHint(S.incident), /Next: Which release/);
  observeIncidentCommand("cat ~/case/release-job.json", incidentFiles["case/release-job.json"], true);
  assert.match(incidentHint(S.incident), /Next: Why was/);
  observeIncidentCommand("cat ~/case/permission-review.yaml", incidentFiles["case/permission-review.yaml"], true);
  assert.match(incidentHint(S.incident), /Answer case questions/);
  const before = JSON.stringify(S.incident);
  assert.throws(() => explainIncidentAnswers({ ...validIncident, caller: "Kai" }), /Not quite/);
  assert.equal(JSON.stringify(S.incident), before);
  assert.match(explainIncidentAnswers(validIncident), /CAUSE VERIFIED/);
  assert.equal(S.incident.explained, true);
});

test("guidance acknowledges completed egress fixes and advances to the missing cause and proofs", async () => {
  const { incidentNextAction } = await import("../.test-build/src/missions/guidance.js");
  const { removeTelemetry, applyPolicy } = await import("../.test-build/src/simulation/operations.js");
  resetState();
  S.evidence = new Set(["rhacs", "logs", "env"]);
  applyPolicy("payment-egress");
  assert.match(incidentNextAction(S).detail, /already blocks/);
  assert.match(incidentNextAction(S).commands[0], /TELEMETRY_ENDPOINT-/);
  removeTelemetry();
  assert.equal(incidentNextAction(S).title, "Who made the change?");
  assert.equal(incidentNextAction(S).commands.some((command) => command.includes("oc apply")), false);
  S.incident.auditSeen = true;
  S.incident.releaseSeen = true;
  S.incident.accessSeen = true;
  assert.equal(incidentNextAction(S).title, "Submit the three case answers");
  S.incident.explained = true;
  assert.match(incidentNextAction(S).commands[0], /rollout status/);
  S.checked.add("rollout");
  assert.match(incidentNextAction(S).commands[0], /ledger:8443/);
  S.checked.add("positive");
  assert.match(incidentNextAction(S).commands[0], /203\.0\.113\.77/);
  assert.match(incidentNextAction(S).detail, /timeout is the expected/);
});

test("campaign witness guidance updates as interviews and records are collected", async () => {
  const { campaignNextAction } = await import("../.test-build/src/campaign/guidance.js");
  resetState();
  S.campaign.active = 1;
  const chapter = chapters[1];
  assert.match(campaignNextAction().title, /Interview/);
  S.campaign.interviews = chapter.witnesses.map((w) => w.who);
  assert.equal(campaignNextAction().title, "Find the case dossier");
  S.campaign.artifactFound = true;
  assert.equal(campaignNextAction().commands[0], "cat ~/campaign/02/briefing.txt");
  S.campaign.evidence.push("briefing.txt");
  assert.equal(campaignNextAction().commands[0], "cat ~/campaign/02/evidence.json");
  S.campaign.evidence.push("evidence.json", "handover.txt");
  assert.equal(campaignNextAction().title, chapter.goals[0].label);
});

test("recorded-cause hints do not tell players to repeat configuration and policy fixes", () => {
  const hint = incidentHint({ auditSeen: true, releaseSeen: true, accessSeen: true, explained: true });
  assert.match(hint, /Cause recorded/);
  assert.doesNotMatch(hint, /Now remove|restrict egress|apply/);
});
