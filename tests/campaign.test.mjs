import test from "node:test";
import assert from "node:assert/strict";
import { parse } from "yaml";
import { resetState, S } from "../.test-build/src/simulation/state.js";
import { chapters } from "../.test-build/src/campaign/catalog.js";
import {
  registerCampaignFiles,
  advanceCampaign,
  chapterRoot,
  campaignChecks,
  runCampaignProbe,
  concludeCampaign,
  observeCampaignCommand,
} from "../.test-build/src/campaign/engine.js";
import {
  applyResource,
  grantScc,
  restartDeployment,
  deleteResource,
  resourceTypes,
} from "../.test-build/src/simulation/cluster-api.js";
import { readVirtualFile } from "../.test-build/src/simulation/filesystem.js";
import {
  encodeProgress,
  decodeProgress,
} from "../.test-build/src/simulation/snapshot.js";
import { flow, resource } from "../.test-build/src/campaign/models.js";
import {
  removeTelemetry,
  applyPolicy,
} from "../.test-build/src/simulation/operations.js";
function setup() {
  resetState();
  registerCampaignFiles();
  S.done = true;
  removeTelemetry();
  applyPolicy("payment-egress");
  S.incident = {
    auditSeen: true,
    releaseSeen: true,
    accessSeen: true,
    explained: true,
  };
  S.story.inventory = ["worker-pass", "maintenance-keycard"];
}
function applyFiles(ch) {
  for (const name of Object.keys(ch.files).filter(
    (f) =>
      f.endsWith(".yaml") &&
      !["root.yaml", "oversized.yaml", "missing.yaml"].includes(f),
  )) {
    const input = parse(
      readVirtualFile("/home/operator/" + chapterRoot() + name),
    );
    const def = Object.values(resourceTypes).find((d) => d.kind === input.kind);
    S.cluster.user =
      !def.namespaced || ["Role", "RoleBinding"].includes(input.kind)
        ? "platform-admin"
        : "operator";
    if (ch.id === "05" && name === "vendor.yaml") continue;
    if (ch.id === "16" && ["client.yaml", "server.yaml"].includes(name))
      deleteResource("pods", name.slice(0, -5), ch.namespace);
    if (ch.id === "07" && name === "consumer.yaml")
      deleteResource("pods", "app", ch.namespace);
    if (ch.id === "25" && name === "app.yaml") {
      S.cluster.user = "platform-admin";
      grantScc("rs-profile", "profiled", ch.namespace);
      S.cluster.user = "operator";
    }
    applyResource(input, ch.namespace);
  }
  if (ch.id === "05") {
    S.cluster.user = "platform-admin";
    grantScc("rs-vendor", "vendor", ch.namespace);
    S.cluster.user = "operator";
    restartDeployment("vendor", ch.namespace);
  }
  S.cluster.user = "operator";
  if (ch.id === "04") {
    assert.match(runCampaignProbe("diagnose"), /^PASS/);
    deleteResource("pods", "broken", ch.namespace);
  }
}
function gather(ch) {
  S.campaign.interviews = ch.witnesses.map((w) => w.who);
  S.campaign.artifactFound = true;
  for (const name of ["briefing.txt", "evidence.json", "handover.txt"])
    observeCampaignCommand("cat /home/operator/" + chapterRoot() + name, true);
}
test("27 chapters can be completed in order through the real resource/admission models", () => {
  setup();
  assert.equal(chapters.length, 27);
  while (S.campaign.active < chapters.length - 1) {
    const ch = advanceCampaign();
    assert.throws(() => concludeCampaign(ch.conclusion), /Case remains open/);
    applyFiles(ch);
    gather(ch);
    if (ch.id === "27") {
      S.cluster.user = "platform-admin";
      const repaired = structuredClone(
        resource("Role", "release-bot", "payments"),
      );
      deleteResource("roles", "release-bot", "payments");
      assert.match(runCampaignProbe("history"), /^FAIL/);
      applyResource(repaired, "payments");
      S.cluster.user = "operator";
    }
    for (const p of ch.probes)
      assert.match(runCampaignProbe(p.id), /^PASS/, ch.id + " " + p.id);
    assert.deepEqual(
      campaignChecks().filter((g) => !g.passed),
      [],
      ch.id,
    );
    concludeCampaign(ch.conclusion);
  }
  assert.equal(S.campaign.finished, true);
  assert.match(
    runCampaignProbe("history"),
    /^PASS/,
    "History remains valid after the final closure",
  );
  assert.ok(
    S.cluster.resources
      .filter((r) => r.kind === "Pod")
      .every((r) => r.status.containerStatuses.every((c) => c.ready)),
    "No failed Pod is left running after the journey",
  );
  assert.ok(
    S.campaign.diagnostics["rs-04"],
    "Runtime diagnosis survives removal of the broken Pod",
  );
  assert.equal(S.campaign.completed.length, 27);
  const restore = decodeProgress(encodeProgress(S));
  assert.equal(restore.campaign.active, 26);
  assert.equal(restore.campaign.reports.length, 26);
  assert.throws(() => advanceCampaign(), /complete/);
});
test("proof expires after mutation; field work and evidence cannot be skipped", () => {
  setup();
  const ch = advanceCampaign();
  applyFiles(ch);
  runCampaignProbe("start");
  runCampaignProbe("root");
  assert.throws(() => concludeCampaign(ch.conclusion), /Interview/);
  gather(ch);
  applyResource(
    {
      apiVersion: "v1",
      kind: "ConfigMap",
      metadata: { name: "new-fact" },
      data: { state: "changed" },
    },
    ch.namespace,
  );
  assert.equal(campaignChecks().filter((g) => !g.passed).length, 2);
  runCampaignProbe("start");
  runCampaignProbe("root");
  concludeCampaign(ch.conclusion);
  assert.throws(() => concludeCampaign(ch.conclusion), /already closed/);
});
test("locked/invalid campaign saves reject, while earlier saves resume Chapter 01", () => {
  resetState();
  assert.throws(() => advanceCampaign(), /current case/);
  const old = JSON.parse(encodeProgress(S));
  delete old.data.campaign;
  assert.equal(decodeProgress(JSON.stringify(old)).campaign.active, 0);
  old.data.campaign = { ...S.campaign, active: 12 };
  assert.throws(() => decodeProgress(JSON.stringify(old)), /invalid campaign/);
});

function atChapter(id) {
  setup();
  let ch;
  while (S.campaign.active < Number(id) - 1) {
    if (S.campaign.active) S.campaign.completed.push(S.campaign.active);
    ch = advanceCampaign();
  }
  return ch;
}
test("network policy union, ANP priority, Pass and destination ingress stay independent", () => {
  const ch = atChapter("14");
  applyFiles(ch);
  const ns = ch.namespace;
  applyResource(
    {
      apiVersion: "v1",
      kind: "Pod",
      metadata: { name: "stranger", labels: { app: "stranger" } },
      spec: {
        containers: [
          {
            name: "stranger",
            image: "registry.example.test/owned:arbitrary-uid",
          },
        ],
      },
    },
    ns,
  );
  applyResource(
    {
      apiVersion: "networking.k8s.io/v1",
      kind: "NetworkPolicy",
      metadata: { name: "server-ingress" },
      spec: {
        podSelector: { matchLabels: { app: "server" } },
        policyTypes: ["Ingress"],
        ingress: [
          { from: [{ podSelector: { matchLabels: { app: "client" } } }] },
        ],
      },
    },
    ns,
  );
  assert.equal(flow(ns, "client", "server"), true);
  assert.equal(flow(ns, "client", "external", ns, true), false);
  S.cluster.user = "platform-admin";
  const admin = structuredClone(
    resource("AdminNetworkPolicy", "rs-external-guard"),
  );
  admin.spec.egress = [{ action: "Allow", to: [{ networks: ["0.0.0.0/0"] }] }];
  applyResource(admin, ns);
  assert.equal(
    flow(ns, "stranger", "server"),
    false,
    "ANP egress Allow cannot bypass destination ingress",
  );
  assert.equal(flow(ns, "client", "external", ns, true), true);
  // A second write uses the latest resourceVersion, as a real API client must.
  admin.metadata.resourceVersion = resource("AdminNetworkPolicy", "rs-external-guard").metadata.resourceVersion;
  admin.spec.egress[0].action = "Pass";
  applyResource(admin, ns);
  assert.equal(
    flow(ns, "client", "server"),
    true,
    "Pass delegates to tenant policy",
  );
  assert.equal(
    flow(ns, "client", "external", ns, true),
    true,
    "Pass delegates to the developer allowance; BANP does not override it",
  );
  S.cluster.user = "operator";
  deleteResource("networkpolicies", "developer-allow", ns);
  assert.equal(
    flow(ns, "client", "external", ns, true),
    false,
    "BANP fallback denies when no tenant egress policy applies",
  );
});
test("quota aggregates Pods, while missing Secret and node capabilities produce runtime/scheduling failures", () => {
  const ch = atChapter("06");
  applyFiles(ch);
  const ns = ch.namespace;
  const copy = structuredClone(resource("Pod", "app", ns));
  delete copy.status;
  copy.metadata = { name: "second" };
  applyResource(copy, ns);
  copy.metadata = { name: "third" };
  assert.throws(() => applyResource(copy, ns), /exceeded quota/);
  const secret = atChapter("07");
  applyFiles(secret);
  const current = resource("Pod", "app", secret.namespace);
  assert.equal(
    current.metadata.annotations["roadshow.secret-version"],
    "training-v2",
  );
  applyResource(
    {
      apiVersion: "v1",
      kind: "Secret",
      metadata: { name: "database" },
      stringData: { password: "training-v3" },
    },
    secret.namespace,
  );
  assert.equal(
    current.metadata.annotations["roadshow.secret-version"],
    "training-v2",
    "env is a startup snapshot",
  );
  assert.match(runCampaignProbe("consume"), /^FAIL/);
  deleteResource("pods", "app", secret.namespace);
  deleteResource("secrets", "database", secret.namespace);
  const missing = parse(
    readVirtualFile("/home/operator/" + chapterRoot() + "consumer.yaml"),
  );
  applyResource(missing, secret.namespace);
  assert.equal(
    resource("Pod", "app", secret.namespace).status.containerStatuses[0].ready,
    false,
  );
  const vlan = atChapter("17");
  applyFiles(vlan);
  const wrong = structuredClone(resource("Pod", "app", vlan.namespace));
  wrong.metadata = { ...wrong.metadata, name: "wrong" };
  wrong.spec.nodeName = "worker-01";
  applyResource(wrong, vlan.namespace);
  assert.equal(
    resource("Pod", "wrong", vlan.namespace).status.phase,
    "Pending",
  );
});
test("recorded pipeline and secret-provider results fail when their live binding disappears", () => {
  const ch = atChapter("18");
  applyFiles(ch);
  assert.match(runCampaignProbe("clean"), /^PASS/);
  const att = structuredClone(
    resource("ConfigMap", "attestation", ch.namespace),
  );
  att.data.scanHigh = "1";
  applyResource(att, ch.namespace);
  assert.match(runCampaignProbe("clean"), /^FAIL/);
  const eso = atChapter("20");
  applyFiles(eso);
  assert.match(runCampaignProbe("sync"), /^PASS/);
  deleteResource("secretstores", "vault", eso.namespace);
  assert.equal(
    resource("ExternalSecret", "database", eso.namespace).status.conditions[0]
      .status,
    "False",
  );
  assert.match(
    runCampaignProbe("sync"),
    /^FAIL/,
    "retained old Secret cannot prove an available provider",
  );
});
test("hidden compliance failures and overbroad syscall profiles cannot pass negative proof", () => {
  const ch = atChapter("23");
  applyFiles(ch);
  const profile = structuredClone(
    resource("TailoredProfile", "district", ch.namespace),
  );
  profile.disableRules.push({
    name: "audit-enabled",
    rationale: "hide failure",
  });
  applyResource(profile, ch.namespace);
  assert.match(runCampaignProbe("applicable"), /^FAIL/);
  const spo = atChapter("25");
  applyFiles(spo);
  const seccomp = structuredClone(
    resource("SeccompProfile", "app", spo.namespace),
  );
  seccomp.spec.syscalls[0].names.push("unshare");
  applyResource(seccomp, spo.namespace);
  assert.match(runCampaignProbe("unshare"), /^FAIL/);
});
