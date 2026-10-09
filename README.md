# The Ghost Route

**A payment succeeds. A second request leaves the cluster. Nobody approved its destination.**

[Play the adventure](https://ralvares.github.io/ghostroute/)

Mira calls you to RHACS Central before the morning release. Checkout is still
working, the dashboard is mostly green, and the application team wants to ship.
Rhea has one observation: payment-api is talking to something outside its
expected boundary. You have a bastion, a notebook, and a question that will
follow you through the entire journey: **who changed the telemetry, how did it
happen, and what will stop it happening again?**

![Enter the cluster district and gather leads from its people.](docs/screenshots/cluster-district.png)

## One investigation, one changing cluster

You enter `prod-east` as an investigator. The cluster is a building you can walk
into; its worker rooms contain the applications and tenant workloads you must
understand. Mira knows the platform. Kai knows the release. Vale holds the
records. Rhea knows what the sensors observed. Their accounts give you leads;
the files and commands let you test them.

At the bastion, the first shortcut is tempting: deny every connection. The
suspicious route disappears—and checkout goes down. Mira wants to know what
you changed. You must restore the dependencies customers need while keeping
the unwanted destination blocked. A quiet alert is not enough to close the case.

The evidence leads back to a release job. It imported an unreviewed support
configuration, and build-bot had permission to patch payment-api. The log gives
you an API caller; it does not prove which person intended the change. You
preserve the timeline, remove the telemetry setting, and repair connectivity.
The immediate incident closes, but its weak links remain. Those become the next
chapters.

Kai's replacement fails under the cluster's security constraints. You inspect
its identity and filesystem instead of granting it root. A vendor workload
cannot be rebuilt so easily; its exception needs a dedicated identity, a narrow
SCC, an owner and an expiry. Meanwhile, another tenant consumes its neighbors'
resources, and a password appears in a support screenshot. Each room exposes a
different shortcut that was convenient until someone depended on it.

Then an apparently familiar image refuses to start. Its registry token leaked
and was revoked. You decode the Secret, test the rejected credential, and use
its replacement with Podman. The bastion login succeeds, but the Pods are still
waiting: their pull credentials belong to the cluster. Only after you repair
that separate path does the workload recover. Skopeo reveals the image's digest
and metadata; a familiar tag alone cannot identify the release you meant to run.

The trail expands into tenant walls, partner connections and a cable behind the
wall. Boundaries must deny the unwanted path without breaking the intended one.
You learn which rules take priority, which tool sees each event, and which
owner must maintain the repair.

At the assembly line, you meet the original failure again. A signed release can
still carry a vulnerable dependency or an unsafe manifest. You scan the image
and its SPDX SBOM with `roxctl`, inspect the findings, and compare the repaired
version. The pipeline applies the same Central policies you tested at the
bastion. The unsafe artifact stops; the repaired artifact proceeds with its
own digest. You also close the unreviewed configuration import. The first
incident now has an explanation and controls that address its cause.

The remaining journey tests whether those controls survive change: rotating
external secrets, suspicious runtime activity, noisy alarms, misleading green
reports and untrusted workloads. In the final handover, earlier repairs are
checked again against the current cluster. Mira gets a working application.
Kai, Vale and Rhea leave with evidence and responsibilities. You leave knowing
why it works, what can still fail, and who will respond.

## The terminal is where the clues become evidence

Explore the world, collect records, take notes, then return to the bastion. The
terminal opens there. Files, resource changes, policy results and application
health all belong to the same saved simulation.

![Investigate retained audit records using jq and the bastion pager.](docs/screenshots/audit-investigation.png)

You can navigate lab files with `cd`, `ls`, `cat` and Tab completion, search logs
with `grep` and `jq`, use JSONPath or Go templates, and read long results with
`less` or `more`. An investigation can start with:

```sh
oc get pods -A
oc logs deployment/payment-api -n payments
oc get deployment/payment-api -n payments -o yaml | less
jq 'select(.verb == "patch" and .objectRef.name == "payment-api") | {user: .user.username, time: .requestReceivedTimestamp, request: .requestObject}' audit/kube-apiserver.log
```

![Scan the authored payment image and inspect its vulnerable dependency.](docs/screenshots/image-scan.png)

Image findings come from the game's versioned asset catalog. The vulnerable
release and its repaired replacement have different content hashes. Image and
SBOM scans use the same authored components; the release gate uses the same
policy evaluation as the interactive checks.

```sh
roxctl image scan --image registry.example.test/payments:v1.8.2 --output table
roxctl image sbom --image registry.example.test/payments:v1.8.2 > payment.spdx.json
roxctl sbom scan --file payment.spdx.json --output json --fail | jq '.result.summary'
roxctl image check --image registry.example.test/payments:v1.8.3
roxctl deployment check --file rhacs/payments-v2.yaml --output json
```

![Use Skopeo to inspect the repaired release and its digest from the bastion.](docs/screenshots/registry-inspection.png)

```sh
skopeo inspect docker://registry.example.test/payments:v1.8.3 | jq -r '.Digest'
skopeo inspect --config docker://registry.example.test/payments:v1.8.3
printf '%s' training-registry-v2 | podman login registry.example.test --username release-bot --password-stdin
podman pull registry.example.test/private/payments:v1.8.3
podman push registry.example.test/private/payments:v1.8.3
```

All credentials and registry addresses in the game are fictional. Kubernetes
pull Secrets retain their standard `kubernetes.io/dockerconfigjson` type and
`oc create secret docker-registry` syntax even though the bastion uses Podman.
Base64 can reveal a Secret's content; it is not encryption.

![The release gate blocks a vulnerable artifact before signing.](docs/screenshots/release-gate.png)

## The 27 stages

Each stage carries the investigation forward. Interviews, dossiers and terminal
evidence lead to a repair; positive and negative checks prove that the required
behavior works and the unsafe path is closed. Earlier resources and notes stay
in `prod-east` throughout the journey.

| Stage | Challenge in the story | What you learn |
| --- | --- | --- |
| 01 · The Ghost Route | Explain the telemetry change and contain it without taking checkout down. | Logs, Deployment configuration, audit evidence and dependency-aware NetworkPolicy. |
| 02 · The Borrowed Image | Kai's replacement cannot write its data directory under the assigned identity. | Arbitrary UIDs, filesystem permissions and fixing an owned application. |
| 03 · The Door That Opens Twice | The release identity can do more than its handover requires. | Scoped RBAC, service accounts and proving a forbidden action is denied. |
| 04 · Permission Denied | A workload asks for authority it should not need. | Restricted SCC admission and the difference between admission and runtime startup. |
| 05 · The Vendor's Locked Box | Third-party software needs an identity you cannot change. | A dedicated service account, narrow custom SCC and accountable exceptions. |
| 06 · The Hungry Tenant | One tenant exhausts shared resources. | LimitRange defaults and aggregate ResourceQuota. |
| 07 · The Password in the Window | A leaked password remains in a running consumer. | Credential retirement, Secret references and restart versus projection updates. |
| 08 · The Glass Front Door | Customers send credentials through an insecure public entrance. | Route TLS, HTTP redirects and where edge encryption ends. |
| 09 · The Familiar Tag | A revoked registry credential blocks a release whose tag looks trustworthy. | Base64 inspection, Podman authentication, pull Secrets, Skopeo and digest pinning. |
| 10 · The Missing Minute | The incident timeline has gaps and an easily blamed API identity. | Correlating caller, request, response and time without inventing attribution. |
| 11 · Draw the City Before the Fire | The team has tools but no agreed map of what matters. | Assets, trust boundaries, abuse paths and control owners. |
| 12 · Three Watchtowers | Different tools report different parts of the same problem. | RHACS, Compliance Operator and Security Profiles Operator responsibilities. |
| 13 · Neighbors Through the Wall | An unrelated tenant can reach a protected workload. | Ingress and egress isolation that preserves the legitimate client. |
| 14 · The Rule Above the Rules | A tenant allow rule conflicts with a corporate boundary. | AdminNetworkPolicy priority, Deny/Allow/Pass and baseline policy. |
| 15 · A Name on the Outside | A partner needs a stable identity for outbound requests. | EgressIP selection and its separation from destination permission. |
| 16 · Two Cities, One Address Book | Tenants need separate network domains. | Primary user-defined networks and domain-specific addressing. |
| 17 · The Cable Behind the Wall | A secondary attachment creates another possible path. | NetworkAttachmentDefinition, worker capabilities and attachment boundaries. |
| 18 · The Assembly Line | An unsafe release can be signed and shipped again. | Image/SPDX scans, CVEs, deployment checks, Central policy gates and digest binding. |
| 19 · Borrowed Secrets | An application needs a scoped external secret projection. | CSI mapping, provider scope and mounted secrets. |
| 20 · The Copy That Must Change | An external credential rotates while a Kubernetes copy goes stale. | External Secrets reconciliation and consumer lifecycle. |
| 21 · One Event Is Not a Story | A runtime event could be support work or suspicious behavior. | Context from Pod, namespace, caller, time and runtime evidence. |
| 22 · The Alarm That Cried Fire | Normal bursts drown out sustained abnormal activity. | Duration-aware detection thresholds and useful correlation. |
| 23 · The Green Report | A green result hides an unresolved applicable failure. | Remediation, justified tailoring and honest compliance evidence. |
| 24 · A Room Inside a Room | An untrusted workload needs a stronger execution boundary. | Kata isolation, runtime prerequisites and SCC admission. |
| 25 · The Smallest Set of Moves | A workload has more syscall access than its normal behavior needs. | Workload-specific seccomp profiles and recording versus enforcement. |
| 26 · The Front-Door Covenant | New workloads can bypass the team's ownership standards. | Scoped admission constraints and bounded exceptions. |
| 27 · The City That Remembers | The team must operate safely after the investigator leaves. | Rechecking earlier controls, evidence handover, ownership and exception expiry. |

Concepts are adapted from the [OpenShift security framework](https://github.com/ralvares/openshift-security-framework).
[CAMPAIGN.md](CAMPAIGN.md) maps stages to its source labs;
[STORYLINE.md](STORYLINE.md) records the incident threads and their resolution.

## What the offline world simulates

The game runs as static HTML, JavaScript, CSS, artwork and local WASM tools.
Progress, notes, resource changes and files save in your browser. After the
initial asset cache finishes, the journey works offline. There is no cluster
connection or backend.

The simulation targets OpenShift 4.22 concepts and selected command/API behavior.
RHACS output is based on pinned `roxctl` 4.11.3 sources and native comparisons.
Authored image hashes are actual SHA-256 hashes of their content records, not
real OCI image manifests. Vulnerability results are deterministic training
fixtures. Container builds, actual container execution, cryptographic signing
and arbitrary external image scans are outside this implementation. Unsupported
commands fail explicitly. The proposed attacker-persona exploitation path is
not yet playable.

[CLUSTER_GUIDE.md](CLUSTER_GUIDE.md) documents command coverage and limits;
[API_CONFORMANCE.md](API_CONFORMANCE.md) records compatibility checks;
[ARCHITECTURE.md](ARCHITECTURE.md) describes shared state and module ownership.
The preserved original game is `legacy/nexus_ghost_route_game.html`.

## Playing and running locally

Move with WASD/arrows or click the world. Press E to interact. Space toggles
Trace Vision near a workload. Walk to the bastion at RHACS Central and interact
with E or nearby T to open the terminal. Notes travel with you. Use the Journey
menu to review stages, and `case status` or `case hint` at the bastion for leads.
Close the opening case and choose **Continue journey** at its debrief.

Type `help` for commands. Read the current `campaign/XX/briefing.txt`, meet its
witnesses, find its dossier, and complete both checks before `case conclude`.
Changes invalidate older checks, so verify the final state. Resources, reports
and notes carry into the next stage.

Requires Node.js 22.12 or later and npm:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Development mode does not install the offline cache.
For a production build and offline play:

```sh
npm test
npm run build
npm run preview -- --port 4174
```

Open http://127.0.0.1:4174. Check `game status` before disconnecting. Progress
saves automatically; reload resumes it. `game export` downloads a portable JSON
backup and `game import` restores one. Saves belong to the browser and origin;
a different port or browser needs export/import. Restart clears current progress.
Serve through HTTPS or localhost; `file://` does not install the offline cache.

Browser checks require Python Playwright and Chromium:

```sh
python3 -m pip install -r tests/requirements.txt
python3 -m playwright install chromium
npm run test:browser
npm run test:semantics
npm run test:cluster
npm run test:offline
npm run test:rpg
python3 tests/campaign_browser.py http://127.0.0.1:4174/
python3 tests/rhacs_browser.py http://127.0.0.1:4174/
```

## Publishing to GitHub Pages

GitHub Pages serves the complete `dist` directory. The included workflow tests,
builds and publishes on a push to master/main, with Pages configured to use
GitHub Actions. For this repository's project path:

```sh
npm ci
npm test
npm run build -- --base=/ghostroute/
```

The published game is [ralvares.github.io/ghostroute](https://ralvares.github.io/ghostroute/).
Use `/` for a user site or custom domain. Cached updates activate when the
complete new build is available; reload to use it. Local progress is retained.
