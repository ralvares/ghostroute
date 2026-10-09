# The City That Remembers

One continuous investigation in prod-east. The same application, workers,
tenants, identities and repaired controls remain in the world. A completed
chapter changes what the player encounters next.

The journey starts with a payment that succeeds—and sends a second request
somewhere nobody approved.

Mira notices the connection through RHACS. Checkout still works, so shutting
everything down would punish the people the investigator is trying to protect.
The player enters the cluster building, speaks to the application team, collects
the release record, and returns to the bastion. Apply deny-all too quickly and
the suspicious traffic stops, but so does checkout. Mira comes running:
“What did you change?”

The first investigation establishes the thread for the whole game. The release
job imported an unreviewed support configuration. The build-bot used its
permission to patch payment-api, enabling the unexpected telemetry destination.
The player preserves the evidence, removes the setting, and restores only the
network paths checkout needs. The incident is contained, but the release
mechanism that allowed it is still there.

Kai brings an emergency replacement. It works on his machine and fails under
the cluster's SCC. The easy answer is root access. The player investigates the
image instead: its filesystem expects an identity the platform deliberately
does not provide. Fixing the application gets it running without weakening the
cluster. Then the player examines the build-bot's permissions and closes the
original write path. Admission alone is insufficient: the process must also be
able to write its intended directories under the admitted identity.

The next rooms expose the shortcuts surrounding that release. A vendor
application needs a narrowly controlled exception. A neighboring tenant consumes
resources without limits. Vale finds a password in a handover screenshot. Moving
it into a Secret cannot undo the exposure: retire the credential, replace it,
and restart the consumer that still holds the old value. At the front door,
customers are sending credentials over plain HTTP. The player repairs that
boundary and distinguishes edge TLS from encryption inside the building.

Then the release stalls again. The image tag looks familiar, but its contents
have changed. Worse, a registry token leaked into a support archive. Vale has
revoked it, and the private application can no longer pull. The player inspects
the encoded Secret, proves the old token is denied, authenticates with its
replacement, and updates the cluster's pull credentials. A successful bastion
login does not repair the Pods. Changing the Deployment's pull Secret creates
new Pods, and the application starts. Pinning the intended digest prevents a
familiar tag from silently selecting different content.

Now the player revisits the original incident with better questions. An audit
log names an API caller; it does not automatically name a guilty person.
Reconstruct the release job, patch, support access, and resulting application
behavior. The established cause is an unsafe release import executed through an
overprivileged delivery identity. Do not invent an attacker attribution where
the retained records do not establish one. Rhea makes the player turn the
verified timeline into a map of assets, trust boundaries, and accountable owners.

That map takes the player deeper into the same cluster. Tenant walls must
preserve legitimate traffic. Corporate rules must survive an accidental
allow-all. Partners need a stable outbound identity. Separate tenant networks
need explicit boundaries, and a secondary attachment must not quietly provide
a route around them. Each repair closes a path identified in the investigation.
Rhea, Mira and Vale establish what RHACS, Compliance Operator and workload
profiles can actually observe or enforce, so the player can verify each boundary
with the appropriate evidence.

At the assembly line, the original story returns. A signature was present, yet
the release was unsafe. The player scans its image and SPDX SBOM, traces the
vulnerable dependency, selects a repaired authored release, and checks its
manifest. The pipeline uses those same Central policies. The vulnerable artifact
stops at the gate; the repaired artifact proceeds with its new digest. The
unreviewed configuration import is also closed. The first incident now has both
an explanation and prevention controls: least-privilege delivery access,
reviewed configuration, enforced network boundaries, and a verified artifact.

The later journey tests whether those repairs endure. External secrets rotate;
necessary Kubernetes copies reconcile. Runtime evidence distinguishes support
work from suspicious activity. Detection must catch sustained abnormal behavior
without drowning the team in normal bursts. A green compliance report must come
from fixing the applicable control. Untrusted workloads receive stronger
isolation and narrower syscall permissions. Admission rules finally enforce
the ownership standards previously left to people remembering them.

The ending returns the player to Mira and the recovered application. Explain
what changed, which job changed it, what permission made it possible, what leaked,
what was revoked, and how the repaired release was verified. Kai owns release
controls; Mira owns operational boundaries; Vale retains evidence and exception
reviews; Rhea owns detection coverage. Exceptions retain an owner and expiry.
The final handover separates the demonstrated prod-east controls from the
recorded fleet context.

It is one long investigation whose consequences become the next chapter. The
final victory is a functioning application and a team that can handle the next
incident without depending on the investigator.

## Chapter continuity

| Chapters | Consequence that drives the next part |
| --- | --- |
| 01–04 | Contain the ghost route, explain the release import, repair the owned image and remove the bot's excessive authority. |
| 05–08 | Preserve necessary vendor functionality, bound tenant resources, retire exposed credentials and repair the public TLS boundary. |
| 09–12 | Recover registry authentication, pin the release, reconstruct the incident timeline and assign control ownership. |
| 13–17 | Enforce the trust boundaries found in that timeline, including tenant, corporate, partner and secondary-network paths. |
| 18 | Return to the original release line: scan images/SBOMs, enforce Central policies, bind the digest, and close the unreviewed import. |
| 19–23 | Keep secrets current, investigate runtime evidence, tune detection and remediate actual posture failures. |
| 24–27 | Isolate untrusted workloads, constrain process behavior, enforce admission standards and deliver an accountable final handover. |

## Resolved incident threads

- Telemetry change: release job importing unreviewed configuration, linked to the
  build-bot patch and resulting application behavior.
- Weak delivery identity: narrowed permission, verified denial, reviewed config.
- Application failure: owned image and filesystem repair; a separate vendor
  exception is justified and bounded rather than generalized.
- Outage during containment: required DNS/ledger paths restored while the
  unintended outbound path remains denied.
- Leaked credentials: old values retired/revoked; fresh values consumed by
  restarted workloads and correctly scoped pull Secrets.
- Mutable or vulnerable artifact: digest binding, dependency repair, image/SBOM
  checks and policy gate before authored signing.
- Unsafe future releases: admission and release controls with owners, evidence
  and exception expiry, verified again at final handover.

The terminal emulates authored workloads and tools offline. Real container
building, cryptographic signing and the proposed attacker-persona exploitation
path are not implemented by this milestone. Their eventual story must consume
and produce evidence in this same world rather than introducing an unrelated
incident or resetting the cluster.
