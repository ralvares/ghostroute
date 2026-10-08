# ROADSHOW — The long road home

The recovered payment district is the beginning. The credential trail crosses
a workshop, a market, the records office, the harbor, the build yard, the watch
district and the council. Rhea follows observations. Mira owns the platform
boundaries. Kai owns the software he can change. Vale keeps the evidence and the
exceptions that must survive tonight. Nobody can close the investigation by
silencing an alert.

Seven acts contain 27 sequential chapters. Existing rooms are reused with the
current district, tenant, witnesses, dossier, workloads and objectives. The
scenes are authored training settings, not discoveries of real clusters.

## Play the journey

Close Ghost Route with its original evidence, rollout and connectivity checks.
Choose **Continue journey** at the debrief. Each subsequent case requires two
physical interviews, an archive dossier, three retained file reads, resource
goals and both positive/negative proof. Use the Journey menu to see the whole
route; Case shows the current checklist. Notes follow you into the bastion.

At the bastion:

```sh
case status
case hint
cd ~/campaign/02
ls
cat briefing.txt
cat evidence.json
cat handover.txt
cat app.yaml
oc apply -f app.yaml -n rs-02
case test start
case test root
case conclude repair-owned
```

Use the chapter briefing for names, tests and dependency order. Roles, bindings,
SCCs and cluster-wide controls need the training platform-admin identity; return
to operator before testing a direct Pod against default restricted admission.
Tab completes live file/directory paths, including relative paths and manifest
arguments; Shift+Tab reverses candidate cycling. Neither future files nor a
positive test alone unlocks a case. Resource changes expire older test receipts.

The vendor case needs its dedicated service account, narrow SCC grant and a
Deployment restart. The profile case also needs its scoped SCC grant before the
consumer Pod is applied. The terminal explains those dependencies. Negative
root/oversized/missing-owner manifests are investigation material, not repairs.

Completion retains reports, resources, notes and the original disruption count.
Progress autosaves locally. Export a portable JSON checkpoint using game export;
import restores it through the bastion. First offline installation requires
network access, then the campaign files and query engines work without it.

## Acts and source coverage

Adapted from the user's [OpenShift security framework](https://github.com/ralvares/openshift-security-framework),
reviewed at commit `e48d32014657e162d04ab1f7a07d4891d0abac03`. Dialogue, cases and evidence are
original training fiction. Links map concepts to source labs; they do not imply
that every source command or operator has been implemented.

| Chapter | Case | Security task | Source labs |
| --- | --- | --- | --- |
| 01 | The Ghost Route | The Deployment environment enabled an unexpected exporter. Preserve checkout while enforcing its intended boundary. | [labs/basic/b4.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/basic/b4.adoc)<br>[labs/basic/b7.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/basic/b7.adoc) |
| 02 | The Borrowed Image | The image expects ownership it does not have. Rebuilding for an arbitrary UID solves the application problem without weakening the platform. | [labs/basic/b1.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/basic/b1.adoc)<br>[labs/basic/b9.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/basic/b9.adoc) |
| 03 | The Door That Opens Twice | The handover needs ConfigMap reads, not secret access, writes or cluster administration. | [labs/basic/b2.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/basic/b2.adoc)<br>[labs/intermediate/i2.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i2.adoc) |
| 04 | Permission Denied | Admission checks the requested security context. The process also needs a compatible image and filesystem permissions. | [labs/basic/b3.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/basic/b3.adoc)<br>[labs/basic/b9.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/basic/b9.adoc) |
| 05 | The Vendor's Locked Box | A dedicated vendor identity and a fixed-UID custom SCC contain this exception. Its owner and expiry must survive the incident. | [labs/basic/b3.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/basic/b3.adoc)<br>[labs/intermediate/i3.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i3.adoc) |
| 06 | The Hungry Tenant | LimitRange defaults individual containers; ResourceQuota bounds aggregate namespace consumption. Neither substitutes for SCC. | [labs/basic/b3a.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/basic/b3a.adoc) |
| 07 | The Password in the Window | The leaked credential is retired. Secret references remove literals; mounted projections can update, while environment variables require a new container start. | [labs/basic/b5.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/basic/b5.adoc) |
| 08 | The Glass Front Door | The edge Route redirects HTTP and terminates TLS. Router-to-service encryption is a separate decision; edge termination does not provide it. | [labs/basic/b10.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/basic/b10.adoc) |
| 09 | The Familiar Tag | An approved registry and a pinned digest answer different questions. The campaign uses a recorded training artifact catalog; it does not contact a registry. | [labs/basic/b6.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/basic/b6.adoc) |
| 10 | The Missing Minute | API caller, resource, timestamp and response must be correlated. Missing request bodies and a successful API call are limits on what the log proves. | [labs/basic/b7.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/basic/b7.adoc)<br>[labs/advanced/audit-logs.md](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/advanced/audit-logs.md) |
| 11 | Draw the City Before the Fire | The threat model names assets, boundaries, abuse paths and owners before selecting tools. A small prioritized backlog is more useful than a catalogue of fears. | [labs/intermediate/i1.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i1.adoc) |
| 12 | Three Watchtowers | RHACS observes and applies build/deploy/runtime policies; Compliance Operator evaluates configuration posture; SPO manages workload profiles. None replaces RBAC, SCC or network enforcement. | [labs/basic/b8.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/basic/b8.adoc) |
| 13 | Neighbors Through the Wall | Selecting ingress and egress policies must preserve the intended client while denying the unrelated peer. | [labs/basic/b4.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/basic/b4.adoc) |
| 14 | The Rule Above the Rules | Admin Deny wins above tenant policy. Pass delegates to NetworkPolicy; BANP applies only when higher tiers do not decide. | [labs/intermediate/i4b.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i4b.adoc)<br>[docs/adminnetworkpolicies.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/docs/adminnetworkpolicies.adoc) |
| 15 | A Name on the Outside | EgressIP fixes the selected tenant's outbound source identity. It does not grant destination access or encrypt the traffic. | [labs/intermediate/i4a.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i4a.adoc) |
| 16 | Two Cities, One Address Book | Distinct primary UDNs establish separate tenant network domains. Overlapping addresses are meaningful only within their own domain. | [labs/intermediate/i4c.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i4c.adoc)<br>[labs/demo/network-flow.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/demo/network-flow.adoc) |
| 17 | The Cable Behind the Wall | The NAD references VLAN 200, and only the designated worker has that recorded capability. Scheduling and secondary-network authorization remain distinct. | [labs/intermediate/i4d.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i4d.adoc)<br>[labs/demo/network-flow.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/demo/network-flow.adoc) |
| 18 | The Assembly Line | The training pipeline gates signing on the recorded scan and binds the attestation to the exact artifact digest. | [labs/intermediate/i5.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i5.adoc) |
| 19 | Borrowed Secrets | The CSI mapping requests one external path and mounts its projection. Provider authentication and rotation are separate lifecycle controls. | [labs/intermediate/i6.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i6.adoc) |
| 20 | The Copy That Must Change | ESO declaratively maps one remote key to a local Secret. The recorded provider version changes; reconciliation updates the local copy. | [labs/intermediate/i6a.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i6a.adoc) |
| 21 | One Event Is Not a Story | The investigation correlates namespace, Pod, caller, time and runtime behavior. Correlation strengthens a claim without replacing its evidence. | [labs/intermediate/i7.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i7.adoc) |
| 22 | The Alarm That Cried Fire | A duration-aware threshold separates the recorded baseline and sustained spike. Exec correlation adds context, not automatic guilt. | [labs/intermediate/i7b.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i7b.adoc) |
| 23 | The Green Report | A justified tailoring exception can suppress an irrelevant rule; it cannot count a failing applicable control as remediated. | [labs/intermediate/i8.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i8.adoc)<br>[docs/compliance-operator-customization.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/docs/compliance-operator-customization.adoc) |
| 24 | A Room Inside a Room | Kata adds a VM boundary. The supported fixture still requires non-root SCC admission and a recorded virtualization-capable node. | [labs/intermediate/i9.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i9.adoc) |
| 25 | The Smallest Set of Moves | A workload-specific profile allows the observed normal calls and denies the recorded unshare request. Recording alone does not enforce a profile. | [labs/intermediate/i9a.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i9a.adoc)<br>[labs/intermediate/i3.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i3.adoc) |
| 26 | The Front-Door Covenant | A scoped admission constraint rejects an ownerless Pod and accepts the compliant tenant workload. Exceptions must not become a wildcard bypass. | [labs/intermediate/i10.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/labs/intermediate/i10.adoc) |
| 27 | The City That Remembers | The final handover binds evidence, control ownership, exception expiry and fleet scope. Completed cases are a learning record, not live multi-cluster posture. | [docs/onboarding.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/docs/onboarding.adoc)<br>[docs/rhacs-internal-entities.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/docs/rhacs-internal-entities.adoc)<br>[docs/plan.adoc](https://github.com/ralvares/openshift-security-framework/blob/e48d32014657e162d04ab1f7a07d4891d0abac03/docs/plan.adoc) |

## Fidelity boundaries

| Surface | What is evaluated | What is not claimed |
| --- | --- | --- |
| Resource API and shell | Namespaced objects, current context, supported verbs/fields, evaluated RBAC and SCC, audit, YAML/JSON and real local jq/Go templates | A complete oc client/API server or arbitrary shell execution |
| SCC and image startup | Restricted UID allocation, capabilities, escalation, seccomp selection, dedicated grants; known image startup fixtures | Exact wording for every 4.22 failure or execution of container images |
| Quota/LimitRange | Pod totals, CPU/memory request/limit totals, defaults, maximum container limits | Every Kubernetes quantity, min/max-ratio rule or quota resource |
| NetworkPolicy | Additive matchLabels ingress/egress rules for literal TCP ports; both directions evaluated | Arbitrary selectors, protocols, named ports or a real packet network |
| ANP/BANP | Priority, egress Deny/Allow/Pass; lower baseline when no higher decision applies | General ingress admin policies or full OVN behavior |
| EgressIP/UDN/VLAN/Kata | Recorded selection, separate primary domains, attachment/node/runtime prerequisites | Allocated IPs, actual VLAN traffic, hypervisors or started VMs |
| Registry/signing/pipeline | Recorded digest, registry admission, scan-before-sign and clean/high fixture gate | Registry pulls, live scans, real Tekton runs or cryptographic signature verification |
| CSI/ESO | Recorded provider scope/projection versus a synchronized local Secret; provider availability and version | A Vault connection, external authentication or an installed operator |
| Audit/correlation/threat model | Retained synthetic records and report fields; attribution/source limits | Identification of a person or proof of exfiltration |
| Prometheus/Compliance/SPO/Gatekeeper | Recorded rule configuration, applicable audit remediation, justified exceptions, syscall allow set and scoped label admission | Running Prometheus, real compliance attestation, kernel/SELinux enforcement or a complete constraint engine |

Unsupported shell syntax reports a simulation limit. Evaluated denied requests
use RBAC/admission failures. Fixture probes identify their evidence boundary in
the terminal output. No synthetic credential or documentation IP is a live
target. A campaign ending asserts completion of these exercises only.

## Verification

The ordered API test applies each chapter's manifests through the shared resource
API, checks both probes and rejects early closure. Negative tests cover policy
tiers/ingress, aggregate quota, secret startup snapshots, capability scheduling,
provider disappearance, pipeline findings, hidden compliance failures and
overly broad syscall profiles.

The browser journey uses actual clicks, field interviews, archive discoveries,
terminal commands, live Tab completion, case gates and debrief buttons across
all 27 chapters. It checks the final 26 follow-on reports, offline reload,
portable export, Journey/Journal and mobile layout. Evidence is recorded in
artifacts/campaign/receipt.json. No browser state is injected to bypass gameplay.

## Continuous incident contract

Chapter 01 explains the matched release-184 support import, build-bot caller
and weak links; it does not invent a human attacker. Chapter 03 withdraws the
original payments bot write grant, and Chapter 18 closes the unreviewed
configuration import. Chapter 27 reevaluates every earlier goal and probe
against current state. The browser journey deliberately deletes the repaired
bot Role, verifies a failed handover and restores it before completion. All
chapters share prod-east and retain the earlier services, resources and notes.
