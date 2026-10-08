import test from "node:test";
import assert from "node:assert/strict";
import { S, resetState } from "../.test-build/src/simulation/state.js";
import {
  changeDirectory,
  listDirectory,
  readVirtualFile,
  makeDirectory,
  writeVirtualFile,
  resolvePath,
} from "../.test-build/src/simulation/filesystem.js";
import {
  decodeProgress,
  encodeProgress,
} from "../.test-build/src/simulation/snapshot.js";
test("lab filesystem resolves relative paths and navigates every lab directory", () => {
  resetState();
  assert.match(listDirectory(), /workloads\//);
  assert.match(listDirectory(), /policies\//);
  changeDirectory("workloads");
  assert.equal(S.cluster.cwd, "/home/operator/workloads");
  assert.match(readVirtualFile("owned-root.yaml"), /runAsUser: 0/);
  assert.match(readVirtualFile("../scc/vendor-fixed-uid.yaml"), /MustRunAs/);
  assert.equal(changeDirectory("-"), "/home/operator");
  changeDirectory("audit");
  assert.doesNotThrow(() =>
    JSON.parse(readVirtualFile("kube-apiserver.log").split("\n")[0]),
  );
  changeDirectory("~");
  assert.equal(resolvePath("../../../../"), "/");
  assert.throws(() => changeDirectory("missing"), /No such directory/);
});
test("local folders, files and cwd survive saves; scenario policy and audit stay read-only", () => {
  resetState();
  makeDirectory("investigation/evidence", true);
  changeDirectory("investigation/evidence");
  writeVirtualFile("notes.txt", "Case 018\n");
  assert.equal(readVirtualFile("./notes.txt"), "Case 018\n");
  assert.throws(() => makeDirectory("notes.txt"), /File exists/);
  assert.throws(
    () => writeVirtualFile("../../policies/deny-all.yaml", "invalid"),
    /read-only/,
  );
  assert.throws(
    () => writeVirtualFile("../../audit/kube-apiserver.log", "invalid"),
    /read-only/,
  );
  const restored = decodeProgress(encodeProgress(S));
  assert.equal(restored.cluster.cwd, "/home/operator/investigation/evidence");
  assert.equal(
    restored.cluster.files["investigation/evidence/notes.txt"],
    "Case 018\n",
  );
  assert.ok(
    restored.cluster.directories.includes("/home/operator/investigation"),
  );
  const old = JSON.parse(encodeProgress(S));
  old.format = "nexus-progress";
  delete old.data.cluster.cwd;
  delete old.data.cluster.previousCwd;
  delete old.data.cluster.directories;
  assert.equal(
    decodeProgress(JSON.stringify(old)).cluster.cwd,
    "/home/operator",
  );
});
