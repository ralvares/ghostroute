# OpenShift 4.22 cluster laboratory

Visit the bastion at RHACS Central, interact with its console, then type
`cat lab.txt`. T opens it only when you are nearby. These
exercises run inside the same game and shared state. The original Ghost Route
mission and its protected infrastructure remain playable.

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

`create`, `apply`, `get`, `describe`, `delete`, merge `patch`, Deployment `scale`,
`set image`, `run`, and rollout status/restart operate on stored resources.
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
the game. Supported pipeline tools are
`jq`, literal `grep`, lexicographic `sort`, `head`/`tail` (`-n`), and `wc -l`.

## Repair an application you own

```sh
oc apply -f workloads/owned-root.yaml
oc apply -f workloads/owned-secure.yaml
oc get pod owned-secure -o yaml
```

The first Pod requests UID 0 and is rejected by its available SCCs. The second
uses an image designed for an arbitrary UID and the existing default constraint.
Its admitted object shows the allocated UID and `openshift.io/scc: restricted-v3`.
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
the vendor image requires UID 1001. The failure appears in `FailedCreate` events,
Deployment conditions and API audit records. This preserves the real distinction
between permission to create a Deployment and SCC admission of its child Pods.

Try granting `anyuid` as the operator:

```sh
oc adm policy add-scc-to-user anyuid -z vendor
```

The operator receives an RBAC Forbidden response. For this local laboratory, the
pre-provisioned administration identity is available through simulated login:

```sh
oc login -u platform-admin -p training
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

The custom SCC permits UID 1001 for the dedicated vendor service account while
retaining host/privilege restrictions. Unrelated service accounts receive no
exception. Grants are stored RoleBindings, and admission reads those bindings.
Revocation affects subsequent Pod admission; it does not revoke an existing
Pod's already admitted security context. Restart creates new Pods for verification.
Default SCCs are protected from edits in this laboratory.

## Investigate audit records

```sh
cat audit/kube-apiserver.log | jq 'select(.responseStatus.code == 403)'
cat audit/kube-apiserver.log | jq -r 'select(.responseStatus.code == 403) | .user.username' | sort
oc adm node-logs master-01 --path=kube-apiserver/audit.log | jq 'select(.verb == "patch")'
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
options, output formats or protected core mutations report a simulator limit;
they are not disguised as RBAC or admission failures.

The current SCC engine models `restricted-v3`, `restricted-v2`, `nonroot-v2`,
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
