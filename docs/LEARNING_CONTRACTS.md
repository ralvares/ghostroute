# Learning contracts

A learning outcome is a claim about resource relationships and observable
behavior. It must be implemented in the shared engine, demonstrated by the
chapter, and protected by a positive and a negative check. A native help page
is documentation, not proof that its operations are implemented.

The game targets OpenShift 4.22. Its native CLI references are `oc` 4.22.0,
`roxctl` 4.11.3 and `tkn` 0.46.1. Component versions have their own contracts:
Tekton Triggers 0.35.1, Argo CD 3.5.4, External Secrets controller v0.18.0,
Secrets Store CSI Driver v1.5.3 and Vault CSI provider v1.5.0. Kata prerequisites
follow OpenShift sandboxed containers 1.11 documentation and Kubernetes 1.35
RuntimeClass admission. These are separately versioned components; their
installation is not implied by OpenShift's version.

## Chapter acceptance

| Stage | Observable contract | Proof and boundary |
| --- | --- | --- |
| 01 | Removing telemetry does not restore a dependency blocked by NetworkPolicy. | Read the retained patch, correlate the release job and binding, repair the Deployment and permit DNS/ledger while denying the external destination. |
| 02 | An admitted container can fail filesystem permissions with an arbitrary UID. | The owned image repair runs under the assigned UID; granting UID 0 is unnecessary. Image filesystem results are authored. |
| 03 | A ServiceAccount's rights come from bindings and rules. | A scoped release Role permits its required action and denies an unrelated Secret read. Namespace ownership is not an authorization shortcut. |
| 04 | SCC admission and container startup are separate. | Inspect a rejection and a Pod that is admitted but cannot start its application. Deployment acceptance does not guarantee ready replicas. |
| 05 | An immutable vendor exception is scoped to its ServiceAccount. | A custom SCC permits the fixed vendor UID; an unrelated identity cannot use that exception. |
| 06 | LimitRange supplies missing defaults; quota accounts for aggregate workload requests/limits. | An oversized request fails; healthy Pods remain within the tenant budget. This is not a CPU throttling or OOM simulator. |
| 07 | Secret references replace literal credentials, but container environment is captured at startup. | Retire the leaked value and recreate the consumer; Secret volume updates and `subPath` have separate behavior. |
| 08 | Edge TLS and redirect configure the router-facing connection, not backend encryption. | Inspect Route TLS/redirect/backend/target port; the stage does not claim an end-to-end TLS handshake. |
| 09 | Registry client login and kubelet image-pull authentication are separate. | A revoked token fails; renewed Podman/Skopeo credentials and a scoped pull Secret restore the authored image pull. Hashes identify authored content, not OCI manifests. |
| 10 | An API identity alone does not establish the human actor. | Match retained request, response, timestamps and handover records; rejected requests do not reconstruct successful changes. |
| 11 | A threat model identifies assets, boundaries, abuse paths and owners. | Complete the evidence-backed model rather than treating a tool inventory as a threat model. |
| 12 | Security tools have distinct responsibilities. | RHACS runtime/image observations, Compliance scan records and SPO profile records remain separate evidence types. |
| 13 | NetworkPolicy selects Pods; ingress and egress isolation are independent. | An authorized client remains reachable while the unrelated tenant fails. Policies combine their applicable allow rules. |
| 14 | ANP priority and Deny/Allow/Pass precede tenant policy; baseline fills undecided traffic. | Both corporate denial and legitimate tenant access must hold in the authored IPv4 peer set. |
| 15 | EgressIP assignment and permitted destinations are distinct. | Eligible-node/address inventory controls assignment; network policy still decides whether traffic is allowed. |
| 16 | A primary UDN provisions a distinct network domain for selected namespaces. | Required labels, readiness, immutable configuration, NAD and network-status are checked. Supported domains are primary IPv4 Layer2/Layer3. |
| 17 | A secondary attachment requires the named NAD and suitable host network capability. | Missing attachment/recorded VLAN capability blocks startup. Host interface/bridge inventory is authored; a game inventory label is not an OpenShift installation procedure. |
| 18 | A remote build uses pushed source, then scan-before-sign and reviewed GitOps promotion. | Local edits or an unchanged push do not fix a failed build. Native PipelineRun/TaskRun records and CLI logs expose the failed step; plain YAML promotion reconciles the same application. |
| 19 | A CSI volume names a same-namespace SecretProviderClass, whose provider maps a remote key into a filename. | Read `/mnt/secrets-store/password` from the actual Pod fixture. Driver/node registration, read-only mounting, provider role/ServiceAccount and exact key are required. No Kubernetes Secret copy is requested. |
| 20 | ESO refreshes a Kubernetes Secret according to its policy; kubelet consumers have their own lifetimes. | Verify the new decoded Secret, an updated mounted file and the old startup environment, then restart the Deployment and verify its new environment. Retained data or a last successful Ready condition cannot alone prove current provider availability. |
| 21 | Exec alerts require API/runtime context before attribution. | Correlate namespace, Pod UID, caller, time and retained process evidence. A successful authorized exec raises the default RHACS exec notification. |
| 22 | A sustained observation differs from a short burst. | Compare authored duration windows against the configured threshold. A timing record is evidence, not a live metrics scrape. |
| 23 | Tailoring must not hide an applicable failing rule. | Required remediation and an unhiding profile produce the authored rescan result. The game does not execute OpenSCAP or reboot a real node. |
| 24 | RuntimeClass admission, node scheduling, installed runtime handler and SCC admission are separate gates. | Missing RuntimeClass is rejected; selector conflicts are rejected; an absent node runtime handler blocks sandbox creation; UID 0 still fails the selected SCC. Kata represents a VM boundary, separate from Linux Pod user namespaces. |
| 25 | A seccomp allow set must cover normal behavior while excluding an unsafe syscall. | Check the recorded normal trace and negative `unshare` trace against the selected Localhost profile. This is not kernel syscall interception. |
| 26 | A namespace-scoped admission constraint requires its declared ownership labels. | Unlabelled workloads fail; correctly labelled workloads pass without broadening an exception. |
| 27 | A handover must recheck controls and preserve evidence and ownership. | Earlier repaired resources remain in prod-east; mutation invalidates semantic proof. Local save/export restores the same investigation. |

`tests/campaign.test.mjs` verifies chapter gates and negative variants.
`tests/campaign_browser.py` traverses every chapter with actual movement,
interviews, files, terminal inputs, rejected premature conclusions and final
history recheck. Tests for shared behavior live in `engine-access`,
`secret-lifecycle`, `service-network`, `release`, `runtime-forensics`, `oc-core`
and the existing API/RHACS suites.

## Secret lifetimes

ESO defaults to Periodic refresh. OnChange reacts to ExternalSecret metadata or
specification changes, not a provider value changing by itself. CreatedOnce
ignores provider changes but repairs a missing/changed target Secret. Owner
sets an owner reference; Orphan does not; Merge requires an existing Secret.
Deletion policy concerns provider data removal, independently of ownership
when an ExternalSecret is deleted. Native metadata hashes use SHA3-224 and
Go's object representation. The engine reproduces those hashes for the
supported string maps and Secret bytes.

A running container's Secret-derived environment remains unchanged. A normal
Secret volume follows the current Secret at deterministic reconciliation;
a `subPath` file stays pinned until a new container/Pod mount. Real kubelet
projection propagation has asynchronous delay. Virtual `sleep 61` advances the
engine clock and reconciles instead of making the player wait a minute.

CSI is a separate model. The installed Secrets Store driver has rotation enabled
with a two-minute poll interval and Secret-sync RBAC already granted. A mounted
Pod reads the recorded Vault provider. `spec.secretObjects` copies mapped mounted
filenames into Kubernetes Secrets; merely creating a SecretProviderClass does
not create a Secret. Synced Secrets carry native managed labels and owner
references and follow their consumers' lifetime. Rotation updates mounted files,
opaque provider versions and synced Secrets. Container environment and subPath
remain pinned. Failed rotation keeps the last good mount; failed Secret sync
produces an Event without inventing a mount failure. The supplied chapter
requests no Secret copy, but the reusable core supports it.

SecretProviderClassPodStatus has the native owner reference, node label,
mount target and object-name IDs. Vault object versions are opaque provider
values, not the Vault KV version number. A fixture can supply recorded
`csiObjectVersions`; otherwise the native provider's empty-version fallback is
represented. Provider records are training assets, not real Vault credentials.

## Kata admission

The fixture assumes the sandboxed-containers operator/runtime installation is
complete on worker-02. Its feature label records eligibility; its Node
runtimeHandlers records the installed handler. Adding a label does not install
Kata. RuntimeClass merges scheduling selectors/tolerations and overhead before
SCC admission. The chapter uses `hostUsers: true` with a non-root restricted SCC;
it does not conflate a Kata VM with restricted-v3's Linux user-namespace model.
The recorded Kata handler does not support `hostUsers: false`. The native
KataConfig CRD and completed status, RuntimeClass and operator workload are
preinstalled. Workloads use the prepared runtime; installation and node reboot
are not game objectives. No VM is launched by the browser.

## Primary references

- [ESO v0.18 refresh policies](https://external-secrets.io/v0.18.0/api/externalsecret/) and [controller source](https://github.com/external-secrets/external-secrets/blob/v0.18.0/pkg/controllers/externalsecret/externalsecret_controller.go).
- [Kubernetes Secret consumer behavior](https://kubernetes.io/docs/concepts/configuration/secret/) and [RuntimeClass](https://kubernetes.io/docs/concepts/containers/runtime-class/).
- [CSI mapping and Pod status](https://secrets-store-csi-driver.sigs.k8s.io/concepts.html), [driver v1.5.3 status generation](https://github.com/kubernetes-sigs/secrets-store-csi-driver/blob/v1.5.3/pkg/secrets-store/utils.go) and [Vault v1.5.0 object versions](https://github.com/hashicorp/vault-csi-provider/blob/v1.5.0/internal/provider/provider.go).
- [OpenShift sandboxed containers 1.11 deployment prerequisites](https://docs.redhat.com/en/documentation/openshift_sandboxed_containers/1.11/html-single/deploying_red_hat_openshift_sandboxed_containers/deploying_red_hat_openshift_sandboxed_containers).

Native printer receipts compare the real CLI against an isolated authored API.
They establish formatting for those cases, not live-cluster conformance or
universal command coverage. Remaining engine scope is tracked in
`API_CONFORMANCE.md` and `CLUSTER_GUIDE.md`.

## Installed controllers and compliance

The starting inventory contains Tekton Pipelines/Triggers, Argo CD, ESO, the
Secrets Store CSI driver, Kata, and Compliance Operator resources. Their CRDs
are discoverable; their controller and runtime state shares the same engine
used by the terminal and campaign. Operator Pods stay in the API and cluster
health view without filling the worker-room investigation floor.

Compliance Operator 1.8.2 uses its native CRDs. The recorded posture adapter
supports Profile/Rule fixtures, TailoredProfile validation and READY/ERROR
status, generated `tailoring.xml` ConfigMaps, ComplianceScan profile IDs and
`tailoringConfigMap`, native CheckResult resources, recorded remediation
application and explicit `compliance.openshift.io/rescan` annotations. A
completed scan remains a point-in-time result until rescan. The included audit
and USB data are authored observations, not a complete OpenSCAP rule corpus.
The ConfigMap remediation demonstrates the API-object lifecycle; it does not
claim to enable RHCOS auditd by writing a ConfigMap. Operator installation is
already complete, not a mission requirement. Additional content, scheduled
suite orchestration and arbitrary remediation payloads require adapters.

Primary implementation sources: [CSI rotation v1.5.3](https://github.com/kubernetes-sigs/secrets-store-csi-driver/blob/v1.5.3/pkg/rotation/reconciler.go),
[CSI Secret sync v1.5.3](https://github.com/kubernetes-sigs/secrets-store-csi-driver/blob/v1.5.3/controllers/secretproviderclasspodstatus_controller.go),
[KataConfig v1.11.0](https://github.com/openshift/sandboxed-containers-operator/blob/v1.11.0/config/crd/bases/kataconfiguration.openshift.io_kataconfigs.yaml),
and [Compliance Operator v1.8.2](https://github.com/ComplianceAsCode/compliance-operator/tree/v1.8.2).
