# Offline OpenShift behavior conformance

The acceptance target is a simulated live cluster, fully offline. A played
campaign is gameplay evidence; it is not proof of complete CLI/API compatibility.
The baseline release did not meet the user's full-compatibility requirement.
This work keeps that requirement open rather than changing it to a command subset.

## Implemented API foundation

Resource writes, including the first incident, pass through `kubeRequest`.
The API distinguishes create, patch, update and delete for authorization. Named
RBAC grants are evaluated against the requested name. JSON Patch operations run
atomically, JSON Merge Patch removes null fields and replaces arrays, and
strategic merging uses upstream struct-tag strategies and merge keys.

Objects have retained identities and opaque revisions. Reads do not advance
object revisions; equivalent JSON key order does not either. Conditional updates reject stale versions; deletion can check
the UID/version so an older request cannot delete a recreated object. Full PUT
replacement removes omitted fields. These are persisted in existing saves;
older saves acquire the storage metadata when loaded.

Server dry runs perform authorization, defaulting and admission on isolated
state. They do not persist resources or run Deployment/Pod controllers. Invalid
writes also discard intermediate changes. Both outcomes retain API audit evidence.
Dry-run creates have no stored revision; dry-run updates retain the existing one,
following the upstream Kubernetes dry-run storage implementation.
Successful commits preserve the incident object's identity and notify the world
and persistence only after commit. Impersonation restores the caller and attaches
both audit identities before notifying subscribers.

Pod admission-generated fields survive strategic updates. Images can change
without changing Pod identity or network attachment. Metadata-only writes do not
restart containers or refresh Secret-backed startup environments. Immutable Pod
fields, ConfigMap/Secret data, RoleBinding roleRef, Deployment selectors, and
Service clusterIP are checked. Deployment metadata does not cause a rollout;
scaling retains surviving Pods and deleting the Deployment cleans up its Pods.

Terminal additions include `replace`, `label`, `annotate`, JSON/merge/strategic
patches, client/server dry runs, generic Secrets, ConfigMap/Secret file and env-file
inputs, and mutation JSON/YAML/name output. Imperative typed JSON follows native
Go field order; resource reads and manifest commands use unstructured printing.

## Independent evidence

- `tools/api-conformance` pins Kubernetes API/apimachinery 1.35.2 and the same
  OpenShift API revision as the existing printer oracle. Its Go program extracts
  strategies/field order and invokes the upstream strategic merge engine.
- `node tools/record-api-fixtures.mjs` rebuilds the independent oracle and records
  generated schemas and ten patch cases. It never imports game code.
- `tests/api-writes.test.mjs` covers patch failures, field removal, conflicts,
  dry-run isolation, admission, identity, namespace/RBAC separation, immutability,
  controller side effects, portable checkpoints and subscriber ordering.
- `tools/check-native-writes.mjs` compares twenty command outputs byte for byte
  with the official native oc 4.22.0 client. Its isolated HTTP adapter decodes native
  protobuf using the upstream serializer. This establishes client-output parity
  for those commands against the mock, not correctness of every server behavior.
- `tests/api_writes_browser.py` uses real terminal input: scaffold a file, preview
  admission, create, investigate, reject a stale replace, recover, change metadata,
  scale, trigger SCC and immutability errors, clean up, then resume offline and
  inspect retained files/resources with real WASM query engines.

Verified on 2026-10-09: 178 automated checks passed, the production build passed,
and 16 read plus 20 write commands matched the official 4.22.0 client byte for
byte. The client came from the official arm64 4.22.0 mirror; its archive SHA-256
matched the published value
`f5e57641566c22da6b0542e8887f449fdc548913db80842f124aaabb796a6d5d`.
Use `GHOSTROUTE_OC=/path/to/oc` with both comparison scripts; build the independent
protobuf decoder with `go build -o /private/tmp/ghostroute-api-oracle .` from
`tools/api-conformance`, or set `GHOSTROUTE_API_ORACLE` to its path.

Browser recovery, cold offline restart/first-use WASM queries, portable saves and
open-tab cache update checks passed without browser errors. Offline readiness now
requires the controlling service worker to confirm the loaded JavaScript entry
is cached, including retrying while that worker activates. Installation checks the cached HTML
against its build checksum before activation; a mixed build is discarded. The
negative cache fixture proves rejection, online retry and subsequent offline play. Recorded receipts and
an inspected browser capture are in `artifacts/api-conformance`.

## First incident shares the store

The Deployment, payment Pods, ledger and policy fixtures are seeded once into
the common resource store. Older saves materialize their recorded incident once;
deleting or scaling a resource no longer causes a subsequent read to regenerate
it from story fields. The terminal's predefined-policy and Deployment mutation
interceptors are removed. Interactive `rsh` still uses its recorded workload
adapter after checking the stored Deployment and running containers.

`incident-controller.ts` projects those resources into the existing story/world
contract. Ordinary env updates, JSON patches, scaling and deletions now share
RBAC, validation, revision conflicts, SCC admission, controllers and audit.
The legacy domain-to-API audit bridge is no longer registered; API writes own
their audit records. Deployment status records the controller's observed generation.

Tenant NetworkPolicy evaluation is shared with Pod diagnostics: selecting policy
permissions form a union, independent of manifest names. DNS and ledger health
are tracked separately, checking source egress and destination ingress. DNS uses
UDP/53; ledger also requires a running, Ready container. Selectors, IPv4 CIDR exceptions, protocols, literal/named
ports, endPort ranges and empty peer lists are evaluated from policy fields. API writes default policy types and port protocols
using the upstream rules, including ingress-only isolation for an empty egress
list when no policy types are provided.
DNS is a recorded daemonset endpoint; a complete DNS/system-Pod simulator remains
open. Node/Pod health maps avoid counting the incident's stored Pods twice.

Real-input browser tests exercised arbitrary first-case changes, SCC controller
failure/repair, a renamed policy that triggers Mira's arrival, partial DNS/ledger
recovery, policy deletion, scale-to-zero and offline recovery. The 27-chapter
browser regression also passed on this build, including physical interviews,
negative completion gates, offline resume and export. This is separate from the
historical manual junior playthrough. The new run exposed and repaired Kai's
blocked UID-advice button. Chapter guidance now identifies cross-tenant manifest
targets and the required Pod recreation after Secret rotation or UDN creation.

## Remaining acceptance work

Complete parity is not established by this milestone. Open areas include
client/server apply ownership and field validation, complete
schemas and validation, status/scale subresources, watch/controller scheduling,
ReplicaSets and ownership/garbage collection, complete discovery and command
flags, SCC strategy coverage and exact error variants, and process/DNS/TLS,
network and operator behavior. These must be simulated and checked, rather than
hidden behind fabricated RBAC or admission denials. Native `rollout status`
comparison remains unaccepted because it uses an API list/watch stream. The
comparison runner bounds native executions to 15 seconds rather than hanging.

These CLI comparisons use a mock server, not a live server conformance suite.
The manual 27-chapter report remains historical evidence for its recorded
build; model-driven campaign regressions run against this change too.

Reference contracts: [API revisions and dry run](https://kubernetes.io/docs/reference/using-api/api-concepts/),
[strategic patch strategies](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/),
[JSON Patch](https://www.rfc-editor.org/rfc/rfc6902),
[JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7396),
[upstream NetworkPolicy defaults](https://github.com/kubernetes/kubernetes/blob/v1.35.2/pkg/apis/networking/v1/defaults.go).

## Authored emulation acceptance (2026-10-09)

The user clarified that offline, scenario-aware behavior is the target: authored
applications, image contents and tool responses are acceptable, provided commands
and controllers react consistently to shared state. Full live server parity is
not the acceptance target. Earlier unimplemented live-cluster items above remain
scope boundaries, not grounds for returning fake success.

RHACS output is pinned to installed native roxctl 4.11.3 and upstream commit
9947d9c2267c78595af7af197c4af8900008b269. The localhost oracle compares image scans,
image policy checks, deployment checks, SPDX generation/scans, CSV/table/JSON,
filters, compact output and failure status. The oracle supplies authored Central
responses; it validates CLI formatting/exit status, not production Central's
policy engine or an up-to-date vulnerability database. Receipts are under
`artifacts/roxctl`. Reproduction and licenses: `tools/roxformat/UPSTREAM.md`.

Verified for this milestone: 192 automated tests; 33/33 native roxctl stdout/exit
comparisons; native OpenShift 4.22 docker-registry Secret data comparison; real
browser Podman/Skopeo/RHACS/SPDX/base64/pager/pipe workflow with offline resume;
and all 27 journey chapters including negative gates, final history recheck,
offline restoration and export. Receipts: `artifacts/roxctl/native-comparison.json`,
`secret-native-comparison.json`, `browser-receipt.json` and `campaign-receipt.json`.
