import { createHash } from "node:crypto";
import { imageDigestMaterial } from "../.test-build/src/security/rhacs/digest-material.js";
import test from "node:test";
import assert from "node:assert/strict";
import { parse, stringify } from "yaml";
import { resetState, S } from "../.test-build/src/simulation/state.js";
import {
  getImage,
  imageAssets,
  imageSbom,
  scanSbom,
} from "../.test-build/src/security/rhacs/images.js";
import { scanImage } from "../.test-build/src/security/rhacs/scan.js";
import {
  checkPolicies,
  checkDeployment,
  failingPolicies,
  centralPolicies,
  pipelineGate,
} from "../.test-build/src/security/rhacs/policies.js";
import { roxctlCommand } from "../.test-build/src/terminal/roxctl.js";
import { clusterCommand } from "../.test-build/src/terminal/cluster-shell.js";
import {
  readVirtualFile,
  writeVirtualFile,
} from "../.test-build/src/simulation/filesystem.js";
import {
  encodeProgress,
  decodeProgress,
} from "../.test-build/src/simulation/snapshot.js";
import { applyResource } from "../.test-build/src/simulation/cluster-api.js";
import { chapters } from "../.test-build/src/campaign/catalog.js";
const ref = "registry.example.test/payments:";
const nativeTable = async (r) => JSON.stringify(r);
const cli = (args) => roxctlCommand(["roxctl", ...args], nativeTable);
test("catalog is immutable and exact; all authored workload images have scan assets", () => {
  resetState();
  assert.notEqual(
    getImage(ref + "v1.8.2").digest,
    getImage(ref + "v1.8.3").digest,
  );
  const a = getImage(ref + "v1.8.2");
  a.components = [];
  assert.equal(getImage(a.ref).components.length, 1);
  assert.equal(
    getImage(
      "registry.example.test/owned:arbitrary-uid@" +
        getImage("registry.example.test/owned:arbitrary-uid").digest,
    ).user,
    "1001",
  );
  assert.throws(
    () => getImage("quay.io/random:latest"),
    /no authored image scan/,
  );
  function walk(o) {
    if (!o || typeof o !== "object") return;
    for (const [k, v] of Object.entries(o)) {
      if (k === "image" && typeof v === "string") assert.ok(getImage(v));
      else walk(v);
    }
  }
  for (const c of chapters) for(const r of Object.values(c.files))if(r?.kind!=="Task"&&r?.metadata?.annotations?.["ghostroute.training/component"]!=="controller")walk(r);
  walk(S.cluster.resources);
});
test("image and SBOM findings agree; repaired package clears findings; unknown packages fail explicitly", () => {
  resetState();
  for (const asset of imageAssets) {
    assert.deepEqual(scanImage(scanSbom(imageSbom(asset))), scanImage(asset));
  }
  assert.equal(
    scanImage(getImage(ref + "v1.8.2")).result.summary["TOTAL-VULNERABILITIES"],
    2,
  );
  assert.equal(
    scanImage(getImage(ref + "v1.8.3")).result.summary["TOTAL-VULNERABILITIES"],
    0,
  );
  const d = imageSbom(getImage(ref + "v1.8.2"));
  d.name = "forged-clean";
  assert.equal(scanImage(scanSbom(d)).result.summary.CRITICAL, 2);
  d.packages[0].versionInfo = "99";
  assert.throws(() => scanSbom(d), /no authored component scan/);
  assert.throws(
    () => scanSbom({ spdxVersion: "SPDX-2.2", packages: [] }),
    /unsupported SBOM version/,
  );
});
test("Central defaults preserve warning versus gate behavior and do not confuse UID1001 with root", () => {
  resetState();
  assert.equal(centralPolicies().length, 89);
  const good = checkPolicies([getImage(ref + "v1.8.3")], "BUILD");
  assert.equal(good.summary.TOTAL, 0);
  const bad = checkPolicies([getImage(ref + "v1.8.2")], "BUILD");
  assert.equal(failingPolicies(bad), 1);
  assert.equal(
    bad.results[0].violatedPolicies.find((p) => p.name.startsWith("Log4Shell"))
      .failingCheck,
    false,
  );
  const root = checkPolicies(
    [getImage("registry.example.test/owned:root")],
    "BUILD",
  );
  assert.equal(root.summary.LOW, 1);
  assert.equal(failingPolicies(root), 0);
  const manifest = parse(readVirtualFile("rhacs/payments-v1.yaml"));
  assert.equal(failingPolicies(checkDeployment(manifest)), 0);
  S.campaign.active = 18;
  assert.equal(failingPolicies(checkDeployment(manifest)), 1);
  assert.equal(
    checkDeployment(parse(readVirtualFile("rhacs/payments-v2.yaml"))).summary
      .TOTAL,
    0,
  );
});
test("policy criteria correlate severity and fix in one CVE; overrides/custom stage policies persist", () => {
  resetState();
  const image = getImage(ref + "v1.8.2");
  image.components[0].vulns[0].fixedBy = "";
  image.components[0].vulns[1].severity = "LOW";
  const r = checkPolicies([image], "BUILD");
  assert.equal(failingPolicies(r), 0);
  S.cluster.rhacs.policyOverrides["a919ccaf-6b43-4160-ac5d-a405e1440a41"] = {
    disabled: true,
  };
  assert.equal(pipelineGate(ref + "v1.8.2").exitCode, 0);
  assert.deepEqual(
    decodeProgress(encodeProgress(S)).cluster.rhacs,
    S.cluster.rhacs,
  );
});
test("CLI native JSON/compact/csv, severity/fail, categories, SPDX roundtrip and explicit flag limits", async () => {
  resetState();
  let r = await cli([
    "image",
    "scan",
    "-i",
    ref + "v1.8.2",
    "-o",
    "json",
    "--fail",
  ]);
  assert.equal(r.exitCode, 1);
  assert.equal(JSON.parse(r.stdout).result.summary.CRITICAL, 2);
  r = await cli([
    "image",
    "scan",
    "-i",
    ref + "v1.8.2",
    "-o",
    "json",
    "--severity",
    "LOW",
    "--fail",
    "--compact-output",
  ]);
  assert.equal(r.exitCode, 0);
  assert.ok(!r.stdout.endsWith("\n"));
  r = await cli([
    "image",
    "check",
    "-i",
    ref + "v1.8.2",
    "-o",
    "json",
    "--categories",
    "Docker CIS",
  ]);
  assert.equal(r.exitCode, 0);
  assert.equal(JSON.parse(r.stdout).summary.TOTAL, 0);
  r = await cli(["image", "scan", "-i", ref + "v1.8.2", "-o", "csv"]);
  assert.ok(r.stdout.startsWith("COMPONENT,VERSION"));
  r = await cli(["image", "sbom", "-i", ref + "v1.8.2"]);
  writeVirtualFile("sbom.json", r.stdout);
  r = await cli([
    "sbom",
    "scan",
    "--file",
    "sbom.json",
    "--output",
    "json",
    "--fail",
  ]);
  assert.equal(r.exitCode, 1);
  assert.equal(JSON.parse(r.stdout).result.summary.CRITICAL, 2);
  r = await cli(["image", "check", "-i", "unknown", "-o", "json"]);
  assert.equal(r.exitCode, 1);
  assert.equal(r.stdout, "");
  assert.match(r.stderr, /no authored image/);
  r = await cli(["sbom", "scan", "-f", "sbom.json"]);
  assert.match(r.stderr, /accepts no positional arguments|option --force/);
  r = await cli(["image", "check", "-i", ref + "v1.8.3", "--invent"]);
  assert.match(r.stderr, /flag needs an argument|not implemented/);
});
test("deployment checks parse multiple YAML documents and repeated files, including List", async () => {
  resetState();
  S.campaign.active = 18;
  const bad = parse(readVirtualFile("rhacs/payments-v1.yaml"));
  const good = parse(readVirtualFile("rhacs/payments-v2.yaml"));
  good.metadata.name = "repaired";
  writeVirtualFile("two.yaml", stringify(bad) + "---\n" + stringify(good));
  const r = await cli(["deployment", "check", "-f", "two.yaml", "-o", "json"]);
  assert.equal(r.exitCode, 1);
  assert.equal(JSON.parse(r.stdout).results.length, 1);
  writeVirtualFile(
    "list.json",
    JSON.stringify({ apiVersion: "v1", kind: "List", items: [good] }),
  );
  assert.equal(
    (await cli(["deployment", "check", "-f", "list.json", "-o", "json"]))
      .exitCode,
    0,
  );
});
test("native Tekton status binds the pushed source and retains failed history", async () => {
 resetState();S.campaign.active=17;S.cluster.user="platform-admin";
 applyResource({apiVersion:"v1",kind:"Namespace",metadata:{name:"rs-18"}});
 for(const [name,r]of Object.entries(chapters.find(c=>c.id==="18").files))if(name.endsWith(".yaml"))applyResource(r,"rs-18");
 const find=(kind,name)=>S.cluster.resources.find(r=>r.kind===kind&&r.metadata.name===name&&r.metadata.namespace==="rs-18");
 const old=structuredClone(find("PipelineRun","release").status);
 assert.equal(old.conditions[0].reason,"Failed");assert.equal(old.signed,undefined);assert.equal(old.scanExitCode,undefined);
 assert.equal(find("TaskRun","release-scan").status.steps[0].terminated.exitCode,1);
 assert.equal(find("TaskRun","release-sign"),undefined);
 for(const cmd of ["git clone https://git.example.test/payments/payment-api.git ~/projects/payment-api","cd ~/projects/payment-api","cat ~/source/fixes/pom.xml > pom.xml","git add pom.xml","git commit -m 'Repair vulnerable dependency'","git push origin main"])await clusterCommand(cmd);
 const latest=S.cluster.resources.filter(r=>r.kind==="PipelineRun").at(-1);
 assert.equal(latest.status.conditions[0].reason,"Succeeded");
 assert.equal(latest.status.results.find(r=>r.name==="image").value,ref+"v1.8.3");
 assert.deepEqual(find("PipelineRun","release").status,old);
 assert.throws(()=>applyResource({...find("PipelineRun","release"),spec:{...find("PipelineRun","release").spec,params:[]}},"rs-18"),/immutable/);
});
test("failing JSON output can still be redirected as Bash does; asset registry is read-only", async () => {
  resetState();
  const r = await clusterCommand(
    "roxctl image check --image " + ref + "v1.8.2 --output json > check.json",
  );
  assert.equal(r.exitCode, 1);
  assert.equal(r.stdout, "");
  assert.equal(JSON.parse(readVirtualFile("check.json")).summary.TOTAL, 2);
  assert.throws(
    () => writeVirtualFile("rhacs/images/catalog.json", "{}"),
    /read-only/,
  );
  const saved = JSON.parse(encodeProgress(S));
  delete saved.data.cluster.rhacs;
  assert.deepEqual(decodeProgress(JSON.stringify(saved)).cluster.rhacs, {
    runtime:{sequence:0,baselines:[],processes:[],alerts:[]},
    policyOverrides: {},
    customPolicies: [],
    receipts: [],
  });
});

test("authored image digests are real SHA256 content hashes, stable across registry aliases", () => {
  for (const asset of imageAssets) {
    assert.equal(
      asset.digest,
      "sha256:" +
        createHash("sha256").update(imageDigestMaterial(asset)).digest("hex"),
    );
    assert.match(asset.digest, /^sha256:[0-9a-f]{64}$/);
    assert.ok(new Set(asset.digest.slice(7)).size > 8);
  }
  assert.equal(
    getImage("registry.example.test/private/payments:v1.8.3").digest,
    getImage("registry.example.test/payments:v1.8.3").digest,
  );
});

test("saved placeholder owned digests upgrade while preserving unrelated notes and image identities", () => {
  resetState();
  const old = "sha256:" + "a".repeat(64);
  const ref = "registry.example.test/owned:arbitrary-uid";
  S.cluster.resources.push({
    apiVersion: "v1",
    kind: "Pod",
    metadata: { name: "prior-release", namespace: "payments" },
    spec: { containers: [{ name: "app", image: ref + "@" + old }] },
  });
  S.cluster.files["previous-release.yaml"] = "image: " + ref + "@" + old;
  S.cluster.files["notes.txt"] = "Unrelated evidence digest " + old;
  const restored = decodeProgress(encodeProgress(S));
  assert.equal(
    restored.cluster.resources.find((r) => r.metadata.name === "prior-release")
      .spec.containers[0].image,
    ref + "@" + getImage(ref).digest,
  );
  assert.equal(
    restored.cluster.files["previous-release.yaml"],
    "image: " + ref + "@" + getImage(ref).digest,
  );
  assert.equal(
    restored.cluster.files["notes.txt"],
    S.cluster.files["notes.txt"],
  );
});
