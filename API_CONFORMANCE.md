# Offline OpenShift behavior conformance

The acceptance target is a simulated live cluster, fully offline. A played
campaign is gameplay evidence; it is not proof of complete CLI/API compatibility.
The baseline release did not meet the user's full-compatibility requirement.
This work keeps that requirement open rather than changing it to a command subset.

## Implemented API foundation

All new writes pass through `kubeRequest`, not terminal-owned object replacement.
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
- `tools/check-native-writes.mjs` compares sixteen command outputs byte for byte
  with the official native oc 4.22.0 client. Its isolated HTTP adapter decodes native
  protobuf using the upstream serializer. This establishes client-output parity
  for those commands against the mock, not correctness of every server behavior.
- `tests/api_writes_browser.py` uses real terminal input: scaffold a file, preview
  admission, create, investigate, reject a stale replace, recover, change metadata,
  scale, trigger SCC and immutability errors, clean up, then resume offline and
  inspect retained files/resources with real WASM query engines.

Verified on 2026-10-09: 171 automated checks passed, the production build passed,
and 16 read plus 16 write commands matched the official 4.22.0 client byte for
byte. The client came from the official arm64 4.22.0 mirror; its archive SHA-256
matched the published value
`f5e57641566c22da6b0542e8887f449fdc548913db80842f124aaabb796a6d5d`.
Use `GHOSTROUTE_OC=/path/to/oc` with both comparison scripts; build the independent
protobuf decoder with `go build -o /private/tmp/ghostroute-api-oracle .` from
`tools/api-conformance`, or set `GHOSTROUTE_API_ORACLE` to its path.

Browser recovery, cold offline restart/first-use WASM queries, portable saves and
open-tab cache update checks passed without browser errors. Offline readiness now
requires the controlling service worker to confirm the loaded JavaScript entry
is cached, including retrying while that worker activates. Recorded receipts and
an inspected browser capture are in `artifacts/api-conformance`.

## Remaining acceptance work

Complete parity is not established by this milestone. The original incident
still has a separate operation bridge. That needs to become ordinary resource
operations before arbitrary first-case edits can share the same semantics. Other
open areas include client/server apply ownership and field validation, complete
schemas and validation, status/scale subresources, watch/controller scheduling,
ReplicaSets and ownership/garbage collection, complete discovery and command
flags, SCC strategy coverage and exact error variants, and process/DNS/TLS,
network and operator behavior. These must be simulated and checked, rather than
hidden behind fabricated RBAC or admission denials.

These CLI comparisons use a mock server, not a live server conformance suite.
The manual 27-chapter report remains historical evidence for its recorded
build; model-driven campaign regressions run against this change too.

Reference contracts: [API revisions and dry run](https://kubernetes.io/docs/reference/using-api/api-concepts/),
[strategic patch strategies](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/),
[JSON Patch](https://www.rfc-editor.org/rfc/rfc6902),
[JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7396).
