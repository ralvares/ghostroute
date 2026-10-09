# OpenShift 4.22 cluster laboratory

Visit the bastion at RHACS Central, interact with its console, then type
`cat lab.txt`. T opens it only when you are nearby. These
exercises run inside the same game and shared state. The first incident uses
ordinary stored Deployments, Pods and NetworkPolicies throughout the journey.

## Story and navigation

Talk to Rhea for the incident report, then Mira for physical worker-room access.
Search the operator hub locker for the records archive keycard. Interview Kai and
Vale and add leads to your notebook. These physical badges do not grant API or
SCC permissions. Return to the bastion to execute commands; leaving its panel
hides the terminal. The notebook is shared between the world and console and
saves locally. `cat case/assignment.txt` recaps the investigation.

Pods run inside their assigned worker rooms. Namespaces span rooms as logical
tenants. RHACS can manage a fleet; this case connects to one training cluster,
prod-east. The external scene marks an untrusted boundary, while the operator hub
is a trusted access zone. Neither location alone establishes API authorization.

Applying default-deny without required egress flags checkout as degraded and
brings Mira over to challenge the outage. Both payment Pods and worker nodes
remain Ready. The application mini map shows blocked DNS/ledger paths; its cluster
view shows node status and scheduled Pods. Targeted egress restores dependencies
while retaining external blocking. Verify from the Pod shell before closing the
case.

## Navigate the lab files

```sh
pwd
ls
cd workloads
ls
cat owned-root.yaml
cat Dockerfile.secure
cd ../policies
cat payments-egress.yaml
cd ~
mkdir -p investigation/evidence
echo 'Review build-bot audit patch' > investigation/evidence/notes.txt
```

All manifests and story records used by this lab are available in the virtual
home directory. Original policy and audit files are read-only; local notes and
custom manifests are writable. Relative apply paths resolve from your current
directory. No host filesystem or process execution is exposed.

## Create and inspect resources

```sh
oc create namespace lab
oc project lab
oc create serviceaccount vendor
oc api-resources
oc get serviceaccounts -o json | jq -r '.items[].metadata.name'
oc get namespaces -o go-template='{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}'
```

`create`, `apply`, `replace`, `get`, `describe`, `delete`, JSON/merge/strategic
`patch`, `label`, `annotate`, Deployment `scale`, `set env`, `set image`, `run`,
and rollout status/restart operate on stored resources. Client/server dry runs
preview supported writes without persistence or controller side effects.
`oc api-resources` lists the implemented resource kinds. YAML/JSON files can be
created in the simulated filesystem:

```sh
echo '{"apiVersion":"v1","kind":"ConfigMap","metadata":{"name":"case"},"data":{"incident":"018"}}' > workloads/case.json
oc apply -f workloads/case.json
oc get configmap case -o json | jq -r '.data.incident'
oc get configmap case -o go-template='{{index .data "incident"}}'
oc delete configmap case
```

Queries evaluate current objects. `jq` uses the real jq 1.8.2 WebAssembly engine;
Go templates use Go's `text/template`, including range, index, conditionals,
printf and `base64decode`. Quoted pipelines are parsed without invoking a host
shell. Compiled engines stay warm in background workers with a five-second limit;
a timed-out worker is replaced. Malformed or long-running expressions do not stop
the game. The same tools read files directly or accept piped output: `cat`,
`jq`, `grep` (`-i`, `-n`, `-v`, `-F`, `-E`, `-c`), `sort` (`-n`, `-r`, `-u`),
`uniq -c`, `head`/`tail -n`, `wc -lwc`, and `cut -d/-f`.
`more` and `less` open a pager inside the bastion. Space/PageDown advances,
b/PageUp goes back, arrows move a line, `/` searches, `n` repeats, and `q` returns
to the prompt. Escape exits the pager first. Mobile has navigation/search/quit buttons.
`less -N` shows line numbers. `man jq` (or another supported tool) opens usage.

```sh
jq 'select(.verb == "patch" and .objectRef.name == "payment-api") | {user: .user.username, time: .requestReceivedTimestamp, request: .requestObject}' audit/kube-apiserver.log
oc logs deployment/payment-api -n payments | less
oc get deployment payment-api -n payments -o yaml | more
jq -c 'select(.responseStatus.code == 403)' audit/kube-apiserver.log > denied.json
jq -r '.user.username' denied.json | sort | uniq -c
less -N audit/kube-apiserver.log
history | tail -n 10
which oc jq less
```

Tab completes file arguments after quoted jq filters as well as `cat`, `less`,
`more`, and output redirection. `echo` and `%s`/`%s\n` `printf` formats write text;
`>` replaces and `>>` appends locally saved files. Audit/scenario policy files
remain read-only. `jq` with no input shows usage; it does not wait on an invisible
stdin. Interactive follow mode, arbitrary executables, shell expansion,
background jobs and control operators are outside this browser shell.
Unknown tools/options fail explicitly. These are bounded CLI semantics, not a
complete Linux host or full OpenShift implementation.

The CLI's resource reads and CRUD now call an offline REST boundary with
Kubernetes paths, API discovery and `Status` errors. For example:

```sh
oc get --raw /api/v1 | jq '.resources[].name'
oc get --raw /apis/apps/v1/namespaces/payments/deployments/payment-api | jq '.spec.template.spec.containers'
```

This runs in process with the same RBAC/admission/controller state; it exposes
no real HTTP server and makes no cluster network request. REST writes currently
support create, full replacement, apply, three patch formats and delete;
stale resourceVersion/UID preconditions reject conflicting writes. Watches,
server-side field ownership and arbitrary API subresources remain open.
The first incident uses the same resource API. Interactive rsh and some domain-specific
SCC/controller helpers retain recorded adapters; a complete oc binary is not shipped.

## Repair an application you own

```sh
oc apply -f workloads/owned-root.yaml
oc apply -f workloads/owned-secure.yaml
oc get pod owned-secure -o yaml
```

The first Pod requests UID 0 and is rejected by its available SCCs. The second
uses an image designed for an arbitrary UID and the existing default constraint.
Its admitted object shows UID 1000 and `openshift.io/scc: restricted-v3`.
The pinned 4.22 `restricted-v3` profile permits UID 1000–65534 inside a Pod
user namespace; `restricted-v2` retains the namespace allocation behavior.
It also shows `hostUsers: false`, capability drops and the generated security
context.

The simulated secure image represents the application changes we want to teach:
support an arbitrary UID, make required data paths writable without root, listen
on an unprivileged port, and avoid unnecessary capabilities or privilege
escalation. If an image still requires root-owned paths, merely removing
`runAsUser` can pass admission and then fail at runtime with permission errors.
That failure is represented separately as `CrashLoopBackOff`, not an SCC denial.

## Investigate a third-party workload you cannot change

```sh
oc apply -f workloads/vendor.yaml
oc rollout status deployment/vendor
oc describe deployment vendor
oc get events
```

The Deployment is created, but its controller cannot create the Pods because
the vendor image requires UID 100. The failure appears in `FailedCreate` events,
Deployment conditions and API audit records. This preserves the real distinction
between permission to create a Deployment and SCC admission of its child Pods.

Try granting `anyuid` as the operator:

```sh
oc adm policy add-scc-to-user anyuid -z vendor
```

The operator receives an RBAC Forbidden response. Recover the sealed emergency
envelope in the records archive and read `credentials/platform-admin.txt`.
Use its separate login command before the administrative steps:

```sh
cat ~/credentials/platform-admin.txt
# Run the login command from the recovered envelope.
oc adm policy add-scc-to-user anyuid -z vendor
oc rollout restart deployment/vendor
oc rollout status deployment/vendor
oc get rolebindings -o yaml
```

`anyuid` allows a wider UID choice; it does not permit privileged containers or
host access. Compare it with the narrower custom SCC for this vendor:

```sh
oc adm policy remove-scc-from-user anyuid -z vendor
oc apply -f scc/vendor-fixed-uid.yaml
oc adm policy add-scc-to-user vendor-fixed-uid -z vendor
oc rollout restart deployment/vendor
oc get pods -o json | jq -r '.items[] | select(.metadata.name | startswith("vendor-sim")) | .metadata.annotations["openshift.io/scc"]'
oc auth can-i use scc/vendor-fixed-uid --as=system:serviceaccount:lab:vendor
oc auth can-i use scc/anyuid --as=system:serviceaccount:lab:default
```

The custom SCC permits UID 100 for the dedicated vendor service account while
retaining host/privilege restrictions. Unrelated service accounts receive no
exception. Grants are stored RoleBindings, and admission reads those bindings.
Revocation affects subsequent Pod admission; it does not revoke an existing
Pod's already admitted security context. Restart creates new Pods for verification.
Default SCCs are protected from edits in this laboratory.

## Investigate audit records

```sh
cat audit/kube-apiserver.log | jq 'select(.responseStatus.code == 403)'
cat audit/kube-apiserver.log | jq -r 'select(.responseStatus.code == 403) | .user.username' | sort
oc adm node-logs control-01 --path=kube-apiserver/audit.log | jq 'select(.verb == "patch")'
```

The local evidence file contains deterministic Kubernetes-shaped JSON audit
events, including the fictional initial payment configuration change. Retrieving
control-plane logs through `oc adm node-logs` requires the administration identity.
Audit authorization records distinguish an RBAC rejection from an authorized Pod
request that later fails SCC admission. Original payment remediation events also
enter this audit stream. Reset/replay creates a fresh world and audit history.

## Offline play and local progress

Use the production build (`npm run build`, then `npm run preview`, or serve `dist`
over HTTPS). On the first visit the game caches its complete build, including both
WASM engines. Type `game status` and wait for `Offline installation: ready` before
disconnecting. After that, the game can reload and run queries without a network.
Development mode is not an offline installation. First installation needs access
to the game's static files; there is no CDN or remote execution dependency.

Progress automatically saves to IndexedDB in this browser: incident evidence and
checks, avatar position and room, physical access passes, discoveries and personal notes,
Deployment/Pod/policy state, laboratory resources and SCC
grants, virtual files, audit history, context/identity, and command history.
Actions checkpoint automatically; movement checkpoints every two seconds and
when the page becomes hidden. Reload offers **Resume the case**; a completed case
restores its debrief. Transient dialogs, Trace Vision and a Pod shell session do
not resume. Restart/replay replaces the current save with a fresh incident.

```sh
game status
game save
game export
game import
```

Export downloads a versioned JSON backup; import opens a local file picker and
replaces the current save after validation. Invalid/incompatible files leave the
current incident intact. Use a backup to move between browsers or hosting URLs.
Browser storage is scoped to the origin and can be cleared or evicted by the
browser; an export is the durable portable copy. Storage/cache failures appear in
`game status`. Use one active game tab; simultaneous tabs do not merge saves.

## Framework lab connections

The [OpenShift Security Framework](https://github.com/ralvares/openshift-security-framework)
provides the learning structure. Its lab files and canonical `data/mapping.json`
use different Basic numbering in places, so these links identify actual files.
The current game covers parts of these exercises, with fictional local images;
it does not execute their real-cluster scripts or claim their full acceptance.

| Framework source                                                                                                                                                                                                                         | Current playable practice                                                                                                  | Next scenario work                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [b1: default security](https://github.com/ralvares/openshift-security-framework/blob/main/labs/basic/b1.adoc), [b9: secure images](https://github.com/ralvares/openshift-security-framework/blob/main/labs/basic/b9.adoc)                | Owned root request fails; arbitrary-UID image runs without an exception; admission and runtime errors differ               | Image-build/provenance evidence and high-port checks                                |
| [b2: RBAC](https://github.com/ralvares/openshift-security-framework/blob/main/labs/basic/b2.adoc)                                                                                                                                        | `can-i`, operator/admin boundaries, stored Roles/RoleBindings and dedicated service accounts                               | Full view/edit/admin tiers and scoped impersonation                                 |
| [b3: SCCs](https://github.com/ralvares/openshift-security-framework/blob/main/labs/basic/b3.adoc), [i3: hardening](https://github.com/ralvares/openshift-security-framework/blob/main/labs/intermediate/i3.adoc)                         | Default restricted-v3, anyuid comparison, fixed-UID vendor exception, grant/revoke and positive/negative admission tests   | Full SELinux/fsGroup handling, documented exception expiry                          |
| [b4: NetworkPolicy](https://github.com/ralvares/openshift-security-framework/blob/main/labs/basic/b4.adoc)                                                                                                                               | Original Ghost Route default-deny outage, targeted recovery and allowed/blocked connectivity proof                         | Namespace segmentation beyond the payment service                                   |
| [b7: audit investigation](https://github.com/ralvares/openshift-security-framework/blob/main/labs/basic/b7.adoc), [advanced audit guide](https://github.com/ralvares/openshift-security-framework/blob/main/labs/advanced/audit-logs.md) | Find the initial configuration actor, filter denied requests, correlate controller SCC failures using real jq/Go templates | Exec/port-forward evidence, source IPs, saved jq rule files and runtime correlation |

Role ownership follows the [canonical responsibility mapping](https://github.com/ralvares/openshift-security-framework/blob/main/data/mapping.json):
Application Developer owns app/UID repairs (R2, R6, R37); Platform Operator owns
SCC/RBAC/network controls and audit operations (R8, R10); DevSecOps Engineer
correlates runtime/incident evidence (R25); Security Architect governs exceptions
(R35). Future missions should reward evidence and minimal permissions, with
explicit ownership and expiry for vendor exceptions. These are scenario ideas,
not additional implemented story missions.

The framework labs are teaching drafts. Their older `restricted-v2` examples
need the documented 4.22 `restricted-v3`/user-namespace context here. An image
requiring root does not necessarily cause an admission error: a Pod with no
disallowed requested security context can be admitted and fail at runtime.
The simulator preserves that distinction. Its local audit data is fictional evidence. The scenario audit file is read-only
inside the virtual shell; browser storage is not an immutable production store.

## Fidelity and current boundaries

This is a resource-backed offline simulator, not the complete `oc` binary or a
running OpenShift cluster. The implemented grammar, API objects, permissions and
admission checks execute real state transitions. Unsupported subcommands,
options, output formats or protected system-resource mutations report a simulator limit;
they are not disguised as RBAC or admission failures.

The inventory contains all thirteen default SCC manifests from the pinned 4.22
operator. Admission remains bounded to `restricted-v3`, `restricted-v2`, `nonroot-v2`,
`anyuid`, and limited custom UID constraints. It evaluates UID, privilege,
capability, seccomp, host namespace/hostPath and read-only-root requirements.
It is not the full OpenShift admission implementation: complete SELinux, fsGroup,
storage, resource quota, scheduling and arbitrary CRD/controller behavior remain
outside this milestone. Admitted laboratory Pods are assigned to worker-01 or worker-02 and appear
inside their assigned worker room. Namespace labels identify the logical tenant;
a Deployment controller is never rendered as a Pod or physical room. NetworkPolicy traffic
simulation remains scoped to the Ghost Route payment service.

Only catalogued fictional images and busybox have runtime behavior. Unknown images
produce `ImagePullBackOff`; no container image is actually pulled or executed.
Rollouts and controller retries are synchronous. State/files/audit are local and
checkpointed to browser storage; there is no backend or real cluster connection.
Go-template tooling is prebuilt and shipped locally; rebuilding it requires Go
(`npm run build:tools`). Normal `npm run build` does not require Go.

SCC and RBAC messages use OpenShift error formats and evaluated reasons. Their
complete provider list depends on the installed SCCs and grants. They have been
verified against documentation and browser fixtures, **not compared byte for byte
with a running OpenShift 4.22 cluster**. Full CLI/admission parity remains work.

Primary references: [OpenShift 4.22 SCCs](https://docs.redhat.com/en/documentation/openshift_container_platform/4.22/html/authentication_and_authorization/managing-pod-security-policies),
[OpenShift 4.22 audit filtering](https://docs.redhat.com/en/documentation/openshift_container_platform/4.22/html/security_and_compliance/audit-log-view),
[OpenShift 4.22 image design](https://docs.redhat.com/en/documentation/openshift_container_platform/4.22/html/images/creating-images),
[jq WebAssembly engine](https://github.com/owenthereal/jq-wasm), and
[Go text/template](https://pkg.go.dev/text/template).


## Resource printing and custom resources

`oc get pods -A` uses `NAMESPACE NAME READY STATUS RESTARTS AGE`. SCC is an
annotation, accessible with JSON, JSONPath or an explicit custom column. `wide`
adds IP, node, nominated node and readiness gates. Container and init-container
states determine readiness, status and restarts, including termination and
restartable sidecars. Resource ages come from creation timestamps on the
deterministic cluster clock; the upstream duration formatter prints two hours
as `120m`. Empty queries use the CLI's ordinary empty-resource message.

`oc get scc` uses the ten columns from the OpenShift 4.22 server printer. The
thirteen default objects are imported from
[the pinned kube-apiserver operator manifests](https://github.com/openshift/cluster-kube-apiserver-operator/tree/a18571de7438badd6206ba84f40a17160f524e94/bindata/bootkube/scc-manifests),
including their actual capabilities, UID strategies and volume lists. Unsupported
host/privileged profile admission remains an explicit simulator limitation.

Installed operator CRD schemas declare the displayed columns. The simulator also
supports applying a new single-version namespaced or cluster-scoped CRD,
discovery through `oc api-resources`, alias resolution, custom-resource CRUD and
`additionalPrinterColumns` with priority for wide output. User-created definitions
and instances survive offline reload and export/import. Deleting installed CRDs
also persists: their resources and discovery
entries are removed, and current-save reload does not reinstall them. Legacy
save migration supplies the newly introduced default schemas once. Structural admission
implements the documented simple types, required fields, bounds, enums, defaults
and unknown-field pruning. Complex schemas, CEL, conversion webhooks,
multi-version conversion and arbitrary operator execution remain unimplemented.

Useful investigation commands:

```sh
oc get pods -A -o wide
oc get pods -n payments --no-headers
oc get pods -A --show-labels -L app
oc get pods -A -l 'app in (payment-api)'
oc get pods -A --field-selector=spec.nodeName=worker-01
oc get pods -A -o 'custom-columns=Name:.metadata.name,SCC:.metadata.annotations.openshift\.io/scc'
oc get scc restricted-v3 -o jsonpath='{.runAsUser.uidRangeMin} {.runAsUser.uidRangeMax}'
oc get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}{"/"}{.metadata.name}{"\n"}{end}'
oc get crd
oc api-resources --api-group=security.openshift.io
```

JSONPath and `jsonpath-as-json` execute the upstream Kubernetes client-go v0.35.2
implementation compiled into local WebAssembly, preserving stdout newlines in
pipelines. JSON, YAML, templates and custom-column queries read the same objects
used by tables. `--sort-by` compares numeric values numerically. Label selectors
support equality, inequality, sets, presence and absence. Implemented field
selectors filter on actual Pod fields. The mock API offers Table negotiation and
paginated collections with invalid/expired cursor errors.

Independent conformance is reproducible: build `tools/conformance` with Go, run
`npm test`, then `node tools/record-printer-fixtures.mjs /path/to/oracle`.
The committed fixture suite contains 47 upstream Pod/SCC/Route cases and eighteen
byte-exact pinned client formatter cases, plus two JSONPrinter fixtures. `node tools/check-native-oc.mjs` directs
the installed real client at the local API and compares sixteen actual commands.
Its receipt records the installed client version (currently 4.20.6); the separate
pinned printer oracle uses the 4.22 API/client dependencies. Neither test is a
live OpenShift 4.22 cluster acceptance test, and this milestone does not establish
100% cluster or CLI compatibility.

## Image, SBOM and policy investigation

At the bastion, `cat rhacs/README.md` opens the supply-chain guide. The authored
catalog is `rhacs/images/catalog.json`. It includes payment releases v1.8.2
(vulnerable), v1.8.3 (dependency repair), and v1.8.4, as well as the campaign's
owned/vendor artifacts. Tags and digests identify immutable game contents. Digests are real SHA-256 hashes of canonical authored image-content records, not downloaded OCI image manifests. Scanner findings and scan timestamps are excluded from the hash; identical contents at the public/private fixture references share a digest.

```
roxctl image scan --image registry.example.test/payments:v1.8.2 --output table
roxctl image check --image registry.example.test/payments:v1.8.2 --output json
roxctl image sbom --image registry.example.test/payments:v1.8.2 > payment.spdx.json
roxctl sbom scan --file payment.spdx.json --output json --fail
roxctl image check --image registry.example.test/payments:v1.8.3
roxctl deployment check --file rhacs/payments-v2.yaml --output json
```

The CLI targets roxctl 4.11.3; its SBOM scan supports SPDX 2.3 JSON. Table, CSV
and JSON output are implemented, including compact JSON, severity/category
filters, chosen/required headers and failure status. Image scan defaults to
legacy image JSON when no output is selected; SBOM scan defaults to raw scan
JSON. SARIF, JUnit, arbitrary package discovery and other roxctl subcommands are
explicit limits. Unknown images or package versions cannot produce a clean scan.

Default policies retain actual enabled/disabled and enforcement settings.
Warnings do not fail a gate. Native deployment check interprets
SCALE_TO_ZERO_ENFORCEMENT; image check interprets FAIL_BUILD_ENFORCEMENT. The
Chapter 18 hardening policy includes deployment enforcement and checks
privilege escalation/read-only root filesystem. Runtime/exposure assessment is
not performed by these command paths. Custom criteria outside the implemented
manifest/image scope fail explicitly if enabled.

In Chapter 18, source, Git history, registry artifact and deployed manifest are
separate. The case files contain Tasks, a Pipeline, prerequisites and a manual
PipelineRun. A manual run fetches the pushed revision even when local files
have been edited. Apply the authored prerequisites and use:

```sh
tkn pr list -n rs-18
tkn pr logs --last -n rs-18
oc get taskruns -n rs-18 -o yaml
oc get pipelineruns -n rs-18 -o json
```

Repair `pom.xml` in the checkout, review `git diff`, add it, commit and push.
The configured EventListener starts the next run. PipelineRun conditions,
childReferences and skippedTasks describe execution; terminated TaskRun steps
hold actual simulated exit codes. No invented PipelineRun scan fields exist.
The gate uses the same image catalog and BUILD policies as roxctl. Signing and
build execution remain deterministic authored behavior.

Then promote the repaired image in `deploy/payment-api.yaml`, commit and push
that manifest. The Argo CD Application reads the pushed directory, checks its
AppProject and controller permissions, and reconciles the same Deployment in
payments. Application status records sync, health, errors and operation results.
Self-heal and prune follow the configured sync policy. This implementation
supports the authored single-directory YAML source; unsupported renderers fail
explicitly.

Pinned contracts: Tekton Pipeline source commit
`d1aa60f88c86a8b966c6fa059d460b5394bff594`, Triggers 0.35.1,
tkn 0.46.1 output and Argo CD 3.5.4 CRDs. Authored endpoints, Secrets and signing
keys must be replaced when adapting manifests to a real environment.

## Encoded Secrets and revoked registry tokens

Secret data can be decoded using real Linux bastion syntax. Secret reads still
require RBAC permission (use the pre-provisioned platform-admin when appropriate).

```
oc get secret database -n rs-07 -o jsonpath='{.data.password}' | base64 -d
printf '%s' training-v2 | base64 -w0
oc get secret registry-leaked -n rs-09 -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d
```

Chapter 09's support archive leaked a fictional release token. Vale revoked it;
renaming or re-encoding it never restores access. `credentials.txt` provides the
replacement and the investigation sequence. Linux `base64` encode/decode, file
input, wrapping, ignore-garbage and pipelines are supported for UTF-8 text.

```
printf '%s' training-registry-v2 | podman login registry.example.test --username release-bot --password-stdin
podman push registry.example.test/private/payments:v1.8.3
podman pull registry.example.test/private/payments:v1.8.3
oc create secret docker-registry registry-current --docker-server=registry.example.test --docker-username=release-bot --docker-password=training-registry-v2 -n rs-09
```

Use either the last command or the supplied `registry-credentials.yaml` when
the Secret does not already exist. Updating a pre-existing Secret uses apply
or patch. `private-release.yaml` changes the Deployment's pull Secret reference,
creating new Pods. A successful Podman login never updates kubelet credentials.
Missing/revoked pull credentials produce ImagePullBackOff; the rebuilt template
uses the replacement Secret. Login/push/pull are authored offline operations for
catalog images; actual repositories, credentials and container engines are never
contacted. Local sessions and recovered resources survive offline saves.

### Podman and Skopeo at the bastion

Use `podman login/logout/pull/push` for the authored registry. `skopeo inspect`
returns JSON or `--format` Go templates; `--config` exposes the image User and
labels. `skopeo list-tags docker://registry.example.test/payments` lists authored
versions. Private inspection accepts `--creds USER:TOKEN`, `--authfile FILE`, or
the bastion login. Inspecting an image does not pull it or change kubelet credentials.
Authentication lives in `.config/containers/auth.json`. Kubernetes still uses the
standard `kubernetes.io/dockerconfigjson` Secret and `oc create secret docker-registry`;
these are API names, independent of the container engine.

Only catalog images are available. No container engine runs on the host. Raw OCI
manifests, actual layers, image builds and Skopeo copy/signing are explicit limits;
image digests hash the authored content, not a real OCI manifest.

Syntax references: [Podman login](https://docs.podman.io/en/stable/markdown/podman-login.1.html)
and [Skopeo inspect](https://github.com/containers/skopeo/blob/main/docs/skopeo-inspect.1.md).


## External credentials and runtimes

The reusable core supports ESO Periodic/OnChange/CreatedOnce refresh,
SecretStore/ClusterSecretStore references, Owner/Orphan/Merge ownership,
Retain/Delete/Merge provider-deletion policy and native Secret hashes/status.
The provider boundary accepts authored Fake and Vault records. Missing stores,
keys, ServiceAccounts or authorized roles fail reconciliation; old Secret data
is not proof of a working provider. Advanced templates/dataFrom/generators are
explicitly unimplemented.

Secret environment is captured at container startup. Regular Secret-volume
files update during reconciliation; subPath remains pinned. `sleep 61` advances
virtual time immediately. Restarting a Deployment obtains the current startup
environment. CSI-only mounts require driver/node registration, a same-namespace
provider class and authorized provider path. They expose readable mounted files
and native Pod status bindings, without an automatic Kubernetes Secret copy.
The driver is preinstalled with rotation enabled (2m) and Secret-sync RBAC.
`secretObjects` creates a copy only once a Pod mounts the provider volume.
Rotation updates files and copies while startup environment/subPath stay pinned.
The synced Secret follows its recorded owner references and is garbage-collected
when those owners disappear. Rotation errors retain the last good projection.

RuntimeClass supplies scheduling and overhead at admission. Node eligibility
and an installed runtime handler are separate checks; SCC still admits the
workload's security context. The Kata fixture is preinstalled on worker-02 and
does not support Linux Pod user namespaces. Operator installation/reboot and
actual VM execution are not simulated. Exact learning acceptance and primary
sources: [learning contracts](docs/LEARNING_CONTRACTS.md).

### Installed platform services

Tekton, Argo CD, ESO, Secrets Store CSI, Kata and Compliance Operator are
preinstalled fixtures. Inspect their namespaces, controller Pods and CRDs with
normal `oc` commands. The native KataConfig records completed runtime setup on
worker-02. Workload admission still requires a valid RuntimeClass, eligible
node/runtime handler and permitted SCC.

Compliance TailoredProfile uses `spec.title`, `spec.description`,
`spec.extends` and `spec.disableRules`. The controller exposes `status.id` and
`status.outputRef` and generates a ConfigMap containing `tailoring.xml`.
ComplianceScan references the XCCDF profile ID and that ConfigMap. Recorded
posture produces native ComplianceCheckResult resources; a supported
ComplianceRemediation changes the recorded target and reports its application
state. Request another evaluation with:

    oc annotate compliancescan district compliance.openshift.io/rescan= --overwrite

An older completed result is not automatically replaced by a newer posture.
The supplied content is a bounded audit/USB dataset; additional scan content and
remediation payloads require authored adapters.
