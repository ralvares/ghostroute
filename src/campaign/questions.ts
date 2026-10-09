import type { Chapter } from "./types.js";

interface QuestionSource {
  question: string;
  file: string;
  field: string;
  format: string;
  hint: string;
}

/** Answers come from the chapter's own manifests, rather than a separate answer key. */
const sources: Record<string, QuestionSource> = {
  "02": { question: "Which image in the replacement manifest supports an arbitrary UID?", file: "app.yaml", field: "spec.containers.0.image", format: "Full image reference", hint: "Compare the replacement image with the broken workload. Copy the image value from app.yaml." },
  "03": { question: "Which user should receive the bounded handover Role?", file: "binding.yaml", field: "subjects.0.name", format: "User name", hint: "The RoleBinding's subjects identify who receives the grant. This is separate from roleRef, which names the Role." },
  "04": { question: "Which failed Pod must be removed after preserving its diagnosis?", file: "broken.yaml", field: "metadata.name", format: "Pod name", hint: "Read the failed workload's metadata.name. Run the diagnosis test before deleting it." },
  "05": { question: "Which custom SCC is dedicated to the vendor workload?", file: "scc.yaml", field: "metadata.name", format: "SCC name", hint: "Find metadata.name in scc.yaml. The exception is granted to the dedicated vendor service account." },
  "06": { question: "How many Pods does the namespace's budget allow?", file: "quota.yaml", field: "spec.hard.pods", format: "Pod count", hint: "ResourceQuota sets the aggregate namespace budget. Read the pods value under spec.hard." },
  "07": { question: "Which Secret must the consumer reference for DB_PASSWORD?", file: "consumer.yaml", field: "spec.containers.0.env.0.valueFrom.secretKeyRef.name", format: "Secret name", hint: "Follow DB_PASSWORD's valueFrom.secretKeyRef to its name. Updating a Secret does not refresh an existing process environment." },
  "08": { question: "Which TLS termination mode is configured on the repaired Route?", file: "route.yaml", field: "spec.tls.termination", format: "TLS termination mode", hint: "Read spec.tls.termination. This describes where TLS ends; HTTP redirection is a separate field." },
  "09": { question: "Which exact image digest is recorded for the approved artifact?", file: "attestation.yaml", field: "data.digest", format: "sha256: followed by the full digest", hint: "Copy data.digest, including its sha256: prefix. A tag alone does not identify this artifact." },
  "10": { question: "Which API caller is named in the reconstructed timeline?", file: "report.yaml", field: "data.caller", format: "Caller name", hint: "Read data.caller in report.yaml. This identifies the credential used, not a proven human culprit." },
  "11": { question: "Which remediation priority is recorded in the threat model?", file: "model.yaml", field: "data.priority", format: "Exact priority value", hint: "Read data.priority. The sequence follows the retained credential and egress weaknesses." },
  "12": { question: "Which responsibility is assigned to the Compliance Operator?", file: "coverage.yaml", field: "data.compliance", format: "Exact responsibility value", hint: "Read the compliance entry in the layer map. Keep it distinct from runtime policies and profile management." },
  "13": { question: "Which TCP destination port must the intended client reach?", file: "client-allow.yaml", field: "spec.egress.0.ports.0.port", format: "Port number", hint: "Read the port in the client's allowed egress rule. The server also needs matching ingress permission." },
  "14": { question: "Which action does the corporate AdminNetworkPolicy take for the guarded egress?", file: "admin.yaml", field: "spec.egress.0.action", format: "Policy action", hint: "Read the AdminNetworkPolicy's egress action. Tenant allow rules cannot override this admin decision." },
  "15": { question: "Which reserved outbound source IP is requested for this tenant?", file: "egress.yaml", field: "spec.egressIPs.0", format: "IPv4 address", hint: "Read the first spec.egressIPs entry. This source identity does not grant destination access." },
  "16": { question: "Which role does the tenant's Layer2 UserDefinedNetwork use?", file: "network.yaml", field: "spec.layer2.role", format: "UDN role", hint: "Read spec.layer2.role. Recreate existing Pods so they join the newly declared primary network." },
  "17": { question: "Which worker is selected for the VLAN-capable workload?", file: "app.yaml", field: "spec.nodeName", format: "Worker name", hint: "Read spec.nodeName. The selected worker must have the capability for the secondary attachment." },
  "18": { question: "Which pipeline task must finish before the sign task runs?", file: "pipeline.yaml", field: "spec.tasks.3.runAfter.0", format: "Task name", hint: "Find the sign task and its runAfter list. Read the named prerequisite; the signing condition also checks its result." },
  "19": { question: "Which Vault role authenticates the CSI secret projection?", file: "provider.yaml", field: "spec.parameters.roleName", format: "Vault role name", hint: "Read roleName in the SecretProviderClass parameters. The role scopes access to the requested external path." },
  "20": { question: "Which remote property is copied into the database Secret?", file: "external.yaml", field: "spec.data.0.remoteRef.property", format: "Remote property name", hint: "Read remoteRef.property. It identifies the remote property, while secretKey names the destination key." },
  "21": { question: "Which caller is linked to the recorded runtime event?", file: "correlation.yaml", field: "data.caller", format: "Caller name", hint: "Read data.caller and correlate it with the Pod and time window. The event alone does not establish data exposure." },
  "22": { question: "How long must the alert condition remain true before firing?", file: "rule.yaml", field: "spec.groups.0.rules.0.for", format: "Duration, including its unit", hint: "Read the alert rule's for field. A brief spike should not satisfy this sustained duration." },
  "23": { question: "Which remediation enables the applicable audit control?", file: "remediation.yaml", field: "metadata.name", format: "Remediation name", hint: "Read metadata.name in remediation.yaml. Applying this remediation differs from excluding an irrelevant rule." },
  "24": { question: "Which RuntimeClass adds the VM isolation boundary?", file: "app.yaml", field: "spec.runtimeClassName", format: "RuntimeClass name", hint: "Read spec.runtimeClassName. SCC admission and the runtime's node prerequisites still apply." },
  "25": { question: "Which seccomp default action rejects unlisted system calls?", file: "profile.yaml", field: "spec.defaultAction", format: "Exact seccomp action", hint: "Read spec.defaultAction. The allowlist preserves recorded normal calls; other calls take this action." },
  "26": { question: "Which label key must every scoped Pod carry?", file: "constraint.yaml", field: "spec.parameters.labels.0.key", format: "Label key", hint: "Read the required labels' key in constraint.yaml. Enter the key, not Kai's label value." },
  "27": { question: "Who owns the controls in the final handover?", file: "handover.yaml", field: "data.owner", format: "Person's name", hint: "Read data.owner in handover.yaml. Retained evidence and accountable exception review remain part of the handover." },
};

export function chapterQuestion(chapter: Chapter) {
  const source = sources[chapter.id];
  if (!source) throw new Error("No case question for Chapter " + chapter.id);
  const object = chapter.files[source.file];
  const value = source.field.split(".").reduce<any>((current, key) => current?.[key], object);
  if (!["string", "number", "boolean"].includes(typeof value))
    throw new Error(`Question source is missing: Chapter ${chapter.id} ${source.file} ${source.field}`);
  return { ...source, answer: String(value), command: `cat ~/campaign/${chapter.id}/${source.file}` };
}

export function checkChapterAnswer(chapter: Chapter, answer: string) {
  const question = chapterQuestion(chapter),
    correct = answer.trim().toLowerCase() === question.answer.toLowerCase();
  return { correct, feedback: correct ? "Correct." : "Not quite. " + question.hint };
}
