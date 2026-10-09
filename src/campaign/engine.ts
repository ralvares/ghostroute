import { stringify } from "yaml";
import { S } from "../simulation/state.js";
import { chapters, materialize, object, workload } from "./catalog.js";
import {
  registerDocuments,
  resolvePath,
  HOME,
} from "../simulation/filesystem.js";
import { applyResource, resourceTypes } from "../simulation/cluster-api.js";
import {
  resource,
  valueAt,
  evaluateProbe,
  reconcileFixtureControllers,
} from "./models.js";
import { tokenize } from "../terminal/lexer.js";
import type { Chapter, Witness } from "./types.js";

export const currentChapter = () => chapters[S.campaign.active];
export const chapterRoot = (ch = currentChapter()) => "campaign/" + ch.id + "/";
function scopeResource(input: any, namespace: string) {
  const result = materialize(input, namespace);
  const def = Object.values(resourceTypes).find((d) => d.kind === result.kind);
  if (def?.namespaced) result.metadata.namespace ??= namespace;
  return result;
}
export function registerCampaignFiles() {
  const files: Record<string, string> = {};
  for (const ch of chapters.slice(1)) {
    const prefix = chapterRoot(ch);
    files[prefix + "briefing.txt"] =
      [
        ch.act,
        ch.title,
        ch.hook,
        "CLUSTER: prod-east · same workers, tenants and controls throughout the journey.",
        "PREVIOUS CASE: " +
          chapters[Number(ch.id) - 2].title +
          " · " +
          chapters[Number(ch.id) - 2].outcome,
        "TENANT: " + ch.namespace,
        "Meet: " +
          ch.witnesses
            .map((w) => w.who.toUpperCase() + " in " + w.scene)
            .join("; "),
        "Search: " + ch.artifact.title + " in " + ch.artifact.scene,
        "Read evidence.json and handover.txt. Inspect manifests before applying them.",
        "Training identities: operator / platform-admin; local password training.",
        "Use the manifest's metadata.namespace when present; otherwise target " +
          ch.namespace + ". Roles, RBAC bindings and cluster controls require platform-admin.",
        ...Object.entries(ch.files).map(([name,value]) => [name,typeof value === "object" ? scopeResource(value,ch.namespace) : value] as const).filter(([name,value]) => name.endsWith(".yaml") && typeof value === "object" && value.metadata?.namespace && value.metadata.namespace !== ch.namespace)
          .map(([name,value]) => "Explicit target: oc apply -f " + name + " -n " + (value as any).metadata.namespace),
        ...(ch.id === "07" ? ["A Secret update does not refresh a process environment. After applying secret.yaml, recreate the consumer: oc delete pod app -n " + ch.namespace + "; oc apply -f consumer.yaml -n " + ch.namespace] : []),
        ...(ch.id === "16" ? ["A primary network is chosen at Pod creation. After applying network.yaml, recreate the tenant Pods: oc delete pod client server -n " + ch.namespace + "; oc apply -f client.yaml -n " + ch.namespace + "; oc apply -f server.yaml -n " + ch.namespace] : []),
        ...(ch.id === "05"
          ? [
              "Vendor exception: apply identity.yaml, scc.yaml and exception.yaml; grant rs-vendor to vendor; restart the vendor Deployment.",
            ]
          : []),
        ...(ch.id === "25"
          ? [
              "Profile binding: apply identity.yaml and scc.yaml as platform-admin; oc adm policy add-scc-to-user rs-profile -z profiled -n " +
                ch.namespace +
                "; log back in as operator before applying app.yaml.",
            ]
          : []),
        "Suggested manifest dependency order: " +
          Object.keys(ch.files)
            .filter((f) => f.endsWith(".yaml"))
            .join(", "),
        "Positive/negative proof: " +
          ch.probes.map((p) => "case test " + p.id).join("; "),
        "Use case status, case hint, then case conclude " +
          ch.conclusion +
          " after collecting and verifying evidence.",
        "FIDELITY: offline fixture models; never a live OpenShift cluster.",
      ].join("\n") + "\n";
    files[prefix + "evidence.json"] =
      JSON.stringify(
        {
          case: ch.id,
          district: ch.district,
          observation: ch.hook,
          retainedRecord: ch.reveal,
          sourceType: "authored-training-fixture",
          files: Object.keys(ch.files),
        },
        null,
        2,
      ) + "\n";
    files[prefix + "handover.txt"] =
      ch.reveal + "\nRISK: " + ch.risk + "\nREPORT: " + ch.conclusion + "\n";
    for (const [name, value] of Object.entries(ch.files))
      files[prefix + name] =
        typeof value === "string"
          ? value + "\n"
          : stringify(scopeResource(value, ch.namespace));
  }
  files["campaign/README.md"] =
    "27 connected chapters. Finish Ghost Route, then continue at its debrief. Cases unlock sequentially.\nEach new case needs two field interviews, an archive discovery, three retained records, resource goals and fresh positive/negative proof.\nCommands: case status; case hint; case test <id>; case conclude <finding>; case next.\nProgress, resources, notes and reports survive offline reload.\n";
  registerDocuments(files);
}
/** Scenario setup is explicitly authored; all player changes still use the API's RBAC/admission. */
export function advanceCampaign() {
  const previous = S.campaign.active;
  if (previous === 0 && S.done && !S.incident.explained)
    throw new Error(
      "Review the original cause at the bastion before continuing: case explain release-import.",
    );
  if (previous === 0 && S.done && !S.campaign.completed.includes(0))
    S.campaign.completed.push(0);
  if (!S.campaign.completed.includes(previous))
    throw new Error("Close the current case before advancing.");
  if (previous === chapters.length - 1)
    throw new Error("The campaign is complete.");
  const index = previous + 1,
    ch = chapters[index];
  S.campaign.active = index;
  S.campaign.interviews = [];
  S.campaign.evidence = [];
  S.campaign.artifactFound = false;
  S.campaign.proofs = {};
  S.campaign.commandStart = S.commands;
  S.campaign.finished = false;
  S.cluster.user = "platform-admin";
  try {
    applyResource(
      object("Namespace", ch.namespace, {
        metadata: {
          name: ch.namespace,
          labels: {
            "roadshow.zone": ch.id === "14" ? "regulated" : "tenant",
            "roadshow.egress": ch.id === "15" ? "partner" : "none",
            ...(ch.id === "16"
              ? { "k8s.ovn.org/primary-user-defined-network": "" }
              : {}),
          },
        },
      }),
      ch.namespace,
    );
    // Capability inventory is a recorded fixture, not detected hardware.
    const node = resource("Node", "worker-02")!;
    node.metadata.labels = {
      ...node.metadata.labels,
      "roadshow.virtualization": "true",
      "roadshow.vlan200": "true",
    };
    S.cluster.user = "operator";
    for (const item of ch.seed)
      applyResource(scopeResource(item, ch.namespace), ch.namespace);
    if (ch.id === "16") {
      const peer = ch.namespace + "-peer";
      applyResource(
        object("Namespace", peer, {
          metadata: {
            name: peer,
            labels: { "k8s.ovn.org/primary-user-defined-network": "" },
          },
        }),
        peer,
      );
      applyResource(
        {
          apiVersion: "k8s.ovn.org/v1",
          kind: "UserDefinedNetwork",
          metadata: { name: "primary", namespace: peer },
          spec: {
            topology: "Layer2",
            layer2: { role: "Primary", subnets: ["10.91.0.0/24"] },
          },
        },
        peer,
      );
      applyResource(scopeResource(workload("peer"), peer), peer);
    }
  } finally {
    S.cluster.user = "operator";
  }
  S.cluster.namespace = ch.namespace;
  return ch;
}
export function recordInterview(who: Witness, scene: string) {
  const ch = currentChapter();
  const w = ch.witnesses.find((w) => w.who === who && w.scene === scene);
  if (w && !S.campaign.interviews.includes(who))
    S.campaign.interviews.push(who);
  return w;
}
export function observeCampaignCommand(raw: string, successfulOutput: boolean) {
  if (!S.campaign.active || !successfulOutput) return;
  const tokens = tokenize(raw);
  if (!["cat", "less", "more"].includes(tokens[0]?.value)) return;
  for (const token of tokens.slice(1)) {
    if (token.kind !== "word") break;
    const path = resolvePath(token.value);
    for (const name of ["briefing.txt", "evidence.json", "handover.txt"])
      if (
        path === HOME + "/" + chapterRoot() + name &&
        !S.campaign.evidence.includes(name)
      )
        S.campaign.evidence.push(name);
  }
}
export function fingerprint() {
  // Reads/audit append do not stale proof. Any resource or control change does.
  return JSON.stringify([S.cluster.resources, S.cluster.sccs]);
}
export function campaignChecks() {
  const ch = currentChapter(),
    fp = fingerprint();
  return [
    ...ch.witnesses.map((w) => ({
      label: "Interview " + w.who.toUpperCase() + " · " + w.scene,
      passed: S.campaign.interviews.includes(w.who),
    })),
    {
      label: "Find " + ch.artifact.title + " · " + ch.artifact.scene,
      passed: S.campaign.artifactFound,
    },
    ...["briefing.txt", "evidence.json", "handover.txt"].map((name) => ({
      label: "Read " + chapterRoot() + name,
      passed: S.campaign.evidence.includes(name),
    })),
    ...ch.goals.map((g) => ({
      label: g.label,
      passed:
        JSON.stringify(
          valueAt(
            resource(g.kind, g.name, g.namespace ?? ch.namespace),
            g.path,
          ),
        ) === JSON.stringify(g.value),
    })),
    ...ch.probes.map((p) => ({
      label: p.label + " · case test " + p.id,
      passed:
        !!S.campaign.proofs[p.id]?.passed &&
        S.campaign.proofs[p.id].fingerprint === fp,
    })),
  ];
}
export function runCampaignProbe(id: string) {
  const ch = currentChapter(),
    p = ch.probes.find((p) => p.id === id);
  if (!p)
    throw new Error(
      "Unknown test. Available: " + ch.probes.map((p) => p.id).join(", "),
    );
  reconcileFixtureControllers();
  const result = evaluateProbe(p.model, ch.namespace);
  if (p.model === "runtime-distinction" && result.passed) {
    const failed = resource("Pod", "broken", ch.namespace);
    if (failed) S.campaign.diagnostics[ch.namespace] = structuredClone(failed);
  }
  S.campaign.proofs[id] = { ...result, fingerprint: fingerprint() };
  return (
    (result.passed ? "PASS" : "FAIL") +
    " · " +
    p.label +
    "\n" +
    result.detail +
    "\nSource: deterministic offline fixture evaluation."
  );
}
export function concludeCampaign(conclusion: string) {
  const ch = currentChapter();
  if (!S.campaign.active)
    throw new Error(
      "Use the original Ghost Route evidence and connectivity verification to close Chapter 01.",
    );
  if (S.campaign.completed.includes(S.campaign.active))
    throw new Error("This chapter is already closed. Use case next.");
  const remaining = campaignChecks().filter((g) => !g.passed);
  if (remaining.length)
    throw new Error(
      "Case remains open:\n" +
        remaining.map((g) => "  · " + g.label).join("\n"),
    );
  if (conclusion !== ch.conclusion)
    throw new Error(
      "That conclusion does not fit the retained evidence. Review handover.txt.",
    );
  S.campaign.completed.push(S.campaign.active);
  S.campaign.trust += 1;
  S.campaign.reports.push({
    chapter: S.campaign.active,
    conclusion,
    commands: S.commands - S.campaign.commandStart,
    trust: S.campaign.trust,
  });
  S.campaign.finished = S.campaign.active === chapters.length - 1;
  return ch;
}
export function campaignStatus() {
  const ch = currentChapter();
  if (!S.campaign.active)
    return (
      "Chapter 01 / " +
      chapters.length +
      " · The Ghost Route\nIdentify the build-bot patch, linked release run and permissions. Read audit/kube-apiserver.log, case/release-job.json and case/permission-review.yaml; use case explain release-import. Then contain and verify checkout before continuing."
    );
  return (
    "Chapter " +
    ch.id +
    " / " +
    chapters.length +
    " · " +
    ch.title +
    "\n" +
    ch.act +
    " · " +
    ch.district +
    " · " +
    ch.namespace +
    "\n" +
    campaignChecks()
      .map((g) => (g.passed ? "[✓] " : "[ ] ") + g.label)
      .join("\n") +
    "\nConclusion: case conclude " +
    ch.conclusion
  );
}
