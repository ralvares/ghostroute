import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { S, resetState } from "../.test-build/src/simulation/state.js";
import { clusterCommand } from "../.test-build/src/terminal/cluster-shell.js";

for (const cli of ["roxctl", "tkn"])
  test(`${cli}: every native nested help page preserves output streams and leaves the engine unchanged`, async () => {
    resetState();
    const reference = JSON.parse(
      readFileSync(`src/terminal/${cli}-help-data.json`),
    );
    assert.equal(Object.keys(reference.pages).length, 75);
    const before = JSON.stringify(S);
    for (const [path, page] of Object.entries(reference.pages)) {
      const response = await clusterCommand(`${cli} ${path} --help`);
      assert.equal(response.stdout, page.stdout, path);
      assert.equal(response.stderr, page.stderr, path);
      assert.equal(response.exitCode, 0, path);
    }
    assert.equal(JSON.stringify(S), before);
    for (const [alias, path] of Object.entries(reference.aliases)) {
      const response = await clusterCommand(`${cli} ${alias} -h`);
      assert.equal(response.stdout, reference.pages[path].stdout, alias);
      assert.equal(response.stderr, reference.pages[path].stderr, alias);
    }
  });

test("global value flags do not redirect help to another command; roxctl stderr is not piped into jq", async () => {
  resetState();
  const rox = JSON.parse(readFileSync("src/terminal/roxctl-help-data.json"));
  assert.equal(
    (await clusterCommand("roxctl -e central.example.test image scan --help"))
      .stderr,
    rox.pages["image scan"].stderr,
  );
  assert.equal(
    (await clusterCommand("roxctl image scan --help > help.txt")).stdout,
    "",
  );
  assert.equal((await clusterCommand("cat help.txt")).stdout, "");
  const oc = JSON.parse(readFileSync("src/terminal/oc-help-data.json"));
  assert.equal(
    (await clusterCommand("oc -n payments get --help")).stdout,
    oc.get,
  );
  const tkn = JSON.parse(readFileSync("src/terminal/tkn-help-data.json"));
  assert.equal(
    (await clusterCommand("tkn -n payments pr logs -h")).stdout,
    tkn.pages["pipelinerun logs"].stdout,
  );
});
