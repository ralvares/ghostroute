import type { SimulationState } from "../simulation/state.js";
import { chapters } from "../campaign/catalog.js";
import { incidentRecords } from "./incident-records.js";
import { chapterQuestion } from "../campaign/questions.js";
import { incidentNextAction } from "./guidance.js";

export interface CommandLead {
  source: string;
  purpose: string;
  commands: string[];
  changes?: boolean;
}
/** Derived from saved discoveries, never overwrites the player's handwritten notes. */
export function collectedCommands(state: SimulationState): CommandLead[] {
  const leads: CommandLead[] = [];
  if (state.campaign.active) {
    const chapter = chapters[state.campaign.active],
      root = `~/campaign/${chapter.id}/`,
      ns = chapter.namespace;
    if (
      state.campaign.interviews.length ||
      state.campaign.artifactFound ||
      state.campaign.evidence.length
    )
      leads.push({
        source: "Field interviews",
        purpose: "Read the retained case records and inspect the namespace.",
        commands: [
          `cat ${root}briefing.txt`,
          `cat ${root}evidence.json`,
          `cat ${root}handover.txt`,
          `oc get pods -n ${ns} -o wide`,
          `oc get events -n ${ns} --sort-by=.metadata.creationTimestamp`,
        ],
      });
    if (state.campaign.artifactFound) {
      const manifests = Object.entries(chapter.files)
        .filter(([name]) => name.endsWith(".yaml"))
        .sort(([, a], [, b]) => {
          const rank = (r: typeof a) =>
            typeof r === "string"
              ? 9
              : ["CustomResourceDefinition", "Namespace", "Project"].includes(
                    r.kind,
                  )
                ? 0
                : [
                      "ServiceAccount",
                      "Role",
                      "ClusterRole",
                      "SecurityContextConstraints",
                      "RuntimeClass",
                      "SecretStore",
                      "ClusterSecretStore",
                      "UserDefinedNetwork",
                      "StorageClass",
                      "ConfigMap",
                      "Secret",
                      "LimitRange",
                      "ResourceQuota",
                      "Task",
                      "Pipeline",
                    ].includes(r.kind)
                  ? 1
                  : [
                        "RoleBinding",
                        "ClusterRoleBinding",
                        "ExternalSecret",
                        "SecretProviderClass",
                        "PersistentVolumeClaim",
                        "NetworkPolicy",
                        "AdminNetworkPolicy",
                        "Service",
                      ].includes(r.kind)
                    ? 2
                    : 3;
          return rank(a) - rank(b);
        });
      leads.push({
        source: chapter.artifact.title,
        purpose: "Inspect the manifests before changing the cluster.",
        commands: manifests.map(([name]) => `cat ${root}${name}`),
      });
      if (manifests.length)
        leads.push({
          source: "Dossier: resource changes",
          purpose:
            "Apply the recorded manifests in dependency order. Read their contents first; negative examples can be rejected.",
          changes: true,
          commands: manifests.map(
            ([name, object]) =>
              `oc apply -f ${root}${name} -n ${typeof object === "object" && object.metadata.namespace ? object.metadata.namespace : ns}`,
          ),
        });
      const extra: Record<string, string[]> = {
        "05": [
          `cat ~/credentials/platform-admin.txt`,
          `oc adm policy add-scc-to-user rs-vendor -z vendor -n ${ns}`,
          `oc rollout restart deployment/vendor -n ${ns}`,
        ],
        "07": [
          `oc delete pod app -n ${ns}`,
          `oc apply -f ${root}consumer.yaml -n ${ns}`,
        ],
        "16": [
          `oc delete pod client server -n ${ns}`,
          `oc apply -f ${root}client.yaml -n ${ns}`,
          `oc apply -f ${root}server.yaml -n ${ns}`,
        ],
        "20": [
          `oc apply -f ${root}consumer.yaml -n ${ns}`,
          `oc rollout restart deployment/legacy-consumer -n ${ns}`,
        ],
        "25": [
          `cat ~/credentials/platform-admin.txt`,
          `oc adm policy add-scc-to-user rs-profile -z profiled -n ${ns}`,
        ],
      };
      if (extra[chapter.id])
        leads.push({
          source: "Consumer and access follow-up",
          purpose:
            "Use the recovered administrator login for SCC grants; resource updates do not refresh existing environment variables.",
          changes: true,
          commands: extra[chapter.id],
        });
      leads.push({
        source: "Case verification",
        purpose: "Run the required proofs after your final changes.",
        commands: [
          ...chapter.probes.map((p) => `case test ${p.id}`),
          "case status",
        ],
      });
      leads.push({
        source: "Case question",
        purpose: chapterQuestion(chapter).question + " Read field " + chapterQuestion(chapter).field + ", then answer in Case file. Hints are available.",
        commands: [chapterQuestion(chapter).command],
      });
    }
    return leads.filter((l) => l.commands.length);
  }
  const found = (id: string) => state.story.discoveries.includes(id);
  if (state.evidence.size || state.story.discoveries.length) {
    const next = incidentNextAction(state);
    if (next.commands.length) leads.push({ source: "Next case step: " + next.title, purpose: next.detail, commands: next.commands });
  }
  if (state.evidence.size || !state.env || state.policy !== "none")
    leads.push({
      source: "Rhea · retained incident records",
      purpose:
        "Review the original observations even after fixing the cluster. These files stay available; compare them with the current API state.",
      commands: Object.values(incidentRecords).map((r) => `cat ~/${r.path}`),
    });
  if (state.evidence.has("rhacs"))
    leads.push({
      source: "Rhea · unexpected egress",
      purpose: "Compare current logs, configuration and egress rules.",
      commands: [
        "oc logs deployment/payment-api -n payments",
        "oc get deployment payment-api -n payments -o yaml",
        "oc get networkpolicies -n payments",
      ],
    });
  if (found("audit") || state.evidence.size >= 3)
    leads.push({
      source: "Vale · API caller",
      purpose:
        "Correlate the patch auditID with the delivery record and permission review.",
      commands: [
        `jq 'select(.verb == "patch" and .objectRef.name == "payment-api") | {auditID, user: .user.username, time: .requestReceivedTimestamp, request: .requestObject}' ~/audit/kube-apiserver.log`,
        "cat ~/case/release-job.json",
        "cat ~/case/permission-review.yaml",
        "case hint",
      ],
    });
  if (
    state.incident.auditSeen &&
    state.incident.releaseSeen &&
    state.incident.accessSeen
  )
    leads.push({
      source: "Matched audit and delivery records",
      purpose:
        "Explain the verified mechanism. The delivery defect does not identify a human attacker.",
      commands: ["case explain release-import"],
    });
  if (found("release"))
    leads.push({
      source: "Kai · imported support configuration",
      purpose:
        "Compare the release record with the configuration and application logs.",
      commands: [
        "cat ~/case/release-job.json",
        "cat ~/case/permission-review.yaml",
        "oc get deployment payment-api -n payments -o yaml",
        "oc logs deployment/payment-api -n payments",
      ],
    });
  if (found("boundary")) {
    leads.push({
      source: "Mira · required checkout paths",
      purpose:
        "Inspect both policies. Default-deny also blocks required dependencies until allowed.",
      commands: [
        "cat ~/policies/deny-all.yaml",
        "cat ~/policies/payments-egress.yaml",
      ],
    });
    leads.push({
      source: "Mira · containment and verification",
      purpose:
        "Restore DNS and ledger while blocking the external path, then verify from a Pod.",
      changes: true,
      commands: [
        "oc apply -f ~/policies/deny-all.yaml -n payments",
        "oc apply -f ~/policies/payments-egress.yaml -n payments",
        "oc rollout status deployment/payment-api -n payments",
        "oc rsh -n payments deployment/payment-api",
        "nslookup kubernetes.default",
        "curl -I http://ledger:8443/health",
        "curl -I https://203.0.113.77/upload",
        "exit",
      ],
    });
  }
  if (found("image"))
    leads.push({
      source: "Kai · application UID",
      purpose: "Compare the owned image and its security settings.",
      commands: [
        "cat ~/workloads/Dockerfile.secure",
        "cat ~/workloads/owned-root.yaml",
        "cat ~/workloads/owned-secure.yaml",
      ],
    });
  if (found("admin-key"))
    leads.push({
      source: "Sealed administrator key",
      purpose:
        "Read the separate login credential before making cluster changes.",
      commands: [
        "cat ~/credentials/platform-admin.txt",
        "oc whoami",
        "oc auth can-i create namespaces",
      ],
    });
  return leads;
}
