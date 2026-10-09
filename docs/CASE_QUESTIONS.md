# Case questions and player guidance

Every chapter has a direct question in **Case file**. Find a named value in the
record, then submit it. These questions replace guessing a conclusion phrase;
the terminal conclusion commands remain available.

Use **Show hint** for a pointer and **Show answer** when you need the exact value.
Incorrect submissions keep the entered answers and game progress. Fixes,
reviewed evidence and accepted conclusions save locally. A correct answer
closes a later chapter only after its visible interviews, record reviews,
resource goals and fresh verification checks pass.

## Chapter 01: Who changed payment-api?

| Question | Record | Field / accepted format |
| --- | --- | --- |
| Which service account patched payment-api? | `~/audit/kube-apiserver.log` | `user.username`; enter the account name after the final colon, or the full service account identity. |
| Which release run made that patch? | `~/case/release-job.json` | `run`; enter the release run name. |
| Which file supplied the telemetry setting? | `~/case/release-job.json` | `input`; enter the environment filename. |

Read `~/case/permission-review.yaml` too. It explains the write grant that
allowed the patch. Compare the release response's `auditID` with the audit
request. The accepted answers record a delivery defect; they do not identify
a human attacker.

Removing the setting, restricting egress and recording the cause are separate
checks. The final service proof requires a completed rollout, reachable ledger
and blocked external destination. Rhea names the actual missing step rather
than repeating an already completed policy change. If you fixed first, the
original records remain in Case file and `~/case/incident-018/`.

![Direct incident questions with their exact evidence fields.](screenshots/direct-case-questions.jpg)

## Chapters 02–27

Each answer below comes from that chapter's shipped manifest, rather than a
separate answer key. Read the named field using the saved command in Case file.

| Chapter | Direct question | Record and field | Answer format |
| --- | --- | --- | --- |
| 02 · The Borrowed Image | Which image in the replacement manifest supports an arbitrary UID? | `~/campaign/02/app.yaml` · `spec.containers.0.image` | Full image reference |
| 03 · The Door That Opens Twice | Which user should receive the bounded handover Role? | `~/campaign/03/binding.yaml` · `subjects.0.name` | User name |
| 04 · Permission Denied | Which failed Pod must be removed after preserving its diagnosis? | `~/campaign/04/broken.yaml` · `metadata.name` | Pod name |
| 05 · The Vendor's Locked Box | Which custom SCC is dedicated to the vendor workload? | `~/campaign/05/scc.yaml` · `metadata.name` | SCC name |
| 06 · The Hungry Tenant | How many Pods does the namespace's budget allow? | `~/campaign/06/quota.yaml` · `spec.hard.pods` | Pod count |
| 07 · The Password in the Window | Which Secret must the consumer reference for DB_PASSWORD? | `~/campaign/07/consumer.yaml` · `spec.containers.0.env.0.valueFrom.secretKeyRef.name` | Secret name |
| 08 · The Glass Front Door | Which TLS termination mode is configured on the repaired Route? | `~/campaign/08/route.yaml` · `spec.tls.termination` | TLS termination mode |
| 09 · The Familiar Tag | Which exact image digest is recorded for the approved artifact? | `~/campaign/09/attestation.yaml` · `data.digest` | sha256: followed by the full digest |
| 10 · The Missing Minute | Which API caller is named in the reconstructed timeline? | `~/campaign/10/report.yaml` · `data.caller` | Caller name |
| 11 · Draw the City Before the Fire | Which remediation priority is recorded in the threat model? | `~/campaign/11/model.yaml` · `data.priority` | Exact priority value |
| 12 · Three Watchtowers | Which responsibility is assigned to the Compliance Operator? | `~/campaign/12/coverage.yaml` · `data.compliance` | Exact responsibility value |
| 13 · Neighbors Through the Wall | Which TCP destination port must the intended client reach? | `~/campaign/13/client-allow.yaml` · `spec.egress.0.ports.0.port` | Port number |
| 14 · The Rule Above the Rules | Which action does the corporate AdminNetworkPolicy take for the guarded egress? | `~/campaign/14/admin.yaml` · `spec.egress.0.action` | Policy action |
| 15 · A Name on the Outside | Which reserved outbound source IP is requested for this tenant? | `~/campaign/15/egress.yaml` · `spec.egressIPs.0` | IPv4 address |
| 16 · Two Cities, One Address Book | Which role does the tenant's Layer2 UserDefinedNetwork use? | `~/campaign/16/network.yaml` · `spec.layer2.role` | UDN role |
| 17 · The Cable Behind the Wall | Which worker is selected for the VLAN-capable workload? | `~/campaign/17/app.yaml` · `spec.nodeName` | Worker name |
| 18 · The Assembly Line | Which pipeline task must finish before the sign task runs? | `~/campaign/18/pipeline.yaml` · `spec.tasks.3.runAfter.0` | Task name |
| 19 · Borrowed Secrets | Which Vault role authenticates the CSI secret projection? | `~/campaign/19/provider.yaml` · `spec.parameters.roleName` | Vault role name |
| 20 · The Copy That Must Change | Which remote property is copied into the database Secret? | `~/campaign/20/external.yaml` · `spec.data.0.remoteRef.property` | Remote property name |
| 21 · One Event Is Not a Story | Which caller is linked to the recorded runtime event? | `~/campaign/21/correlation.yaml` · `data.caller` | Caller name |
| 22 · The Alarm That Cried Fire | How long must the alert condition remain true before firing? | `~/campaign/22/rule.yaml` · `spec.groups.0.rules.0.for` | Duration, including its unit |
| 23 · The Green Report | Which remediation enables the applicable audit control? | `~/campaign/23/remediation.yaml` · `metadata.name` | Remediation name |
| 24 · A Room Inside a Room | Which RuntimeClass adds the VM isolation boundary? | `~/campaign/24/app.yaml` · `spec.runtimeClassName` | RuntimeClass name |
| 25 · The Smallest Set of Moves | Which seccomp default action rejects unlisted system calls? | `~/campaign/25/profile.yaml` · `spec.defaultAction` | Exact seccomp action |
| 26 · The Front-Door Covenant | Which label key must every scoped Pod carry? | `~/campaign/26/constraint.yaml` · `spec.parameters.labels.0.key` | Label key |
| 27 · The City That Remembers | Who owns the controls in the final handover? | `~/campaign/27/handover.yaml` · `data.owner` | Person's name |

![A later chapter keeps the factual question beside its completion checks.](screenshots/chapter-question-and-checks.jpg)

## Finding the next action

- **Character interviews:** retain the narrative and add a current next action,
  its location or copyable command. Save the witness lead to keep that action
  in your handwritten notebook.
- **Radio advice:** acknowledges completed fixes and provides copyable commands
  for the next missing condition. Copy never executes a command.
- **Case file:** shows the question, named source field, hints, retries and the
  completion checklist. Collected leads retain manifest and verification commands.
- **Bastion:** `case hint` names the next action; `case status` lists the checks.
  These are game investigation commands. Workload and policy changes use the
  existing `oc`, `roxctl` and other supported tools.
- **Resume:** shows the saved chapter's story and next action; it does not show
  the opening incident when resuming a later chapter.

The question UI does not perform resource changes, run verification or claim
that a workload is repaired. Accepted answers use the same completion rules as
the existing terminal route. Changes require fresh verification.
