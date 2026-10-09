# Native command reference

The terminal includes **399 native help pages**: 249 from `oc` 4.22.0,
75 from `roxctl` 4.11.3 and 75 from Tekton `tkn` 0.46.1. The `oc` reference includes
all discoverable nested commands and `oc options`. `oc`, `oc get --help`,
`oc help get`, and `oc create secret generic -h` display the appropriate native
page. Container arguments after `--` remain container arguments.

`oc-command-inventory.json` records every captured command path, child command
and long flag, the client version and the SHA-256 of the reference executable.
`src/terminal/oc-help-data.json` retains the complete text, including examples,
defaults, short flags and usage. It is loaded on demand and included in the
offline installation. Native documentation describes the real client; it does
not imply that every described operation or flag is implemented by the emulator.

To refresh the reference with an explicitly selected native client:

```sh
python3 tools/capture-oc-help.py /path/to/oc
python3 tools/capture-cli-help.py roxctl /path/to/roxctl
python3 tools/capture-cli-help.py tkn /path/to/tkn
```

Each inventory records its native executable SHA-256, version, command tree, aliases and flags. Original output streams are retained: roxctl help is stderr; it is not silently fed into a stdout pipeline. Help stderr is displayed as documentation in the terminal. The three lazy reference chunks are cached before offline play.

The capture sets `KUBECONFIG=/dev/null` and executes only help and client-version
commands. It does not log in, inspect a live cluster, or run examples. The source
client is OpenShift's Apache-2.0-licensed `oc`; retain the bundled Kubernetes
license at `public/tools/KUBERNETES-LICENSE`.

## Engine boundary

Stages author resources, files, image contents, character dialogue and goals.
The CLI translates commands into API requests. The API owns identity, RBAC,
admission, storage, revisions, audit and transactions. Controllers derive Pods,
network endpoints, network attachments, pipeline results and GitOps status from
those resources. RHACS consumes successful exec and process observations from
the same state. World health, alerts, evidence and saves consume the committed
results. A stage does not grant success by recognizing a command string.

Operational coverage is recorded in `API_CONFORMANCE.md` and `CLUSTER_GUIDE.md`.
The engine currently provides resource CRUD/patch/dry-run, selectors and native
printers, tenant provisioning/RBAC/SCC, recorded Pod diagnostics, Deployment
reconciliation, Services/Endpoints/Routes, primary UDN, authored registry and
RHACS checks/runtime observations, pushed Git revisions, Tekton and GitOps.
Many native command families and flags still require implementation. Unknown
operations return explicit emulator limitations; they never manufacture success
or disguise missing behavior as a permissions failure.

`oc expose` now generates a Service from a Pod/Deployment or a Route from a
Service and submits it through the API. `oc extract` reads a Secret/ConfigMap
through the API and writes decoded UTF-8 data into the bastion filesystem.
Neither operation depends on chapter names. The virtual filesystem does not
currently store arbitrary binary files.
