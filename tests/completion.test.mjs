import { test } from "node:test";
import assert from "node:assert/strict";
import { resetState, S } from "../.test-build/src/simulation/state.js";
import {
  changeDirectory,
  makeDirectory,
  writeVirtualFile,
} from "../.test-build/src/simulation/filesystem.js";
import { pathCompletions } from "../.test-build/src/terminal/path-completion.js";
test("Tab uses cwd for cd/cat and manifest arguments instead of canned commands", () => {
  resetState();
  assert.deepEqual(pathCompletions("cd pol"), ["cd policies/"]);
  changeDirectory("policies");
  assert.deepEqual(pathCompletions("cat den"), ["cat deny-all.yaml "]);
  assert.deepEqual(pathCompletions("oc apply -f ./pay"), [
    "oc apply -f ./payments-egress.yaml ",
  ]);
  assert.deepEqual(pathCompletions("cd den"), []);
});
test("Tab handles quoted paths, live files and completion at a cursor", () => {
  resetState();
  makeDirectory("evidence");
  writeVirtualFile("evidence/findings.json", "{}");
  assert.deepEqual(pathCompletions('cat "evidence/fin'), [
    'cat "evidence/findings.json" ',
  ]);
  assert.deepEqual(pathCompletions("cat evidence/fin | jq .", 16), [
    "cat evidence/findings.json | jq .",
  ]);
  assert.equal(pathCompletions("oc get po"), null);
  assert.deepEqual(pathCompletions("cat absent"), []);
  assert.equal(S.cluster.cwd, "/home/operator");
});
