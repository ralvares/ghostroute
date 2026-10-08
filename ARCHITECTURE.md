# ROADSHOW architecture and migration history

## Original inventory and dependencies

The preserved 60 KB HTML uses DOM/CSS overlays and a native Canvas 2D world.
It has no dependencies, external assets, audio, persistence, backend or network
access. Graphics (racks, Pods, avatar, stations, NPCs, moving network signals)
are drawn procedurally. Responsive CSS and a horizontal mobile camera preserve
the world on narrow screens; reduced-motion preferences are recognized.

| Responsibility  | Existing behavior                                                                                                               | Dependencies                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| World/rendering | Two worker nodes, two payment replicas, ledger, RHACS and Ops stations, external edge; animation and labels                     | Canvas, positions, shared state, Trace Vision       |
| Movement/input  | WASD/arrows, click-to-walk, proximity prompt, E interaction, Space trace, T terminal                                            | Frame clock, objects, overlay focus/blocking        |
| Characters      | Rhea analyst and Mira engineer, contextual radio conversations                                                                  | Evidence, environment configuration, network policy |
| Terminal        | Bastion and Pod shells, command history, Tab/Right suggestions, Ctrl+L/R, files, help and errors                                | State, clues, simulated resources, UI               |
| Simulation      | Deployment environment removal, revision/Pod replacement, logs, egress policies, DNS and ledger/external tests                  | Command interpreter and shared state                |
| Security        | RHACS baseline deviation, five correlated evidence clues, caseboard, trace paths                                                | World interaction, logs/config/policy reads         |
| Mission         | Investigation, root-cause removal, egress restriction, rollout and positive/negative proof; S/A/B grade, outage penalty, replay | Evidence and state/verification sets                |
| UI              | Briefing, HUD, toast/radio, details, caseboard, terminal, debrief                                                               | Shared state and actions                            |

SCC and RBAC are mentioned educationally, but the original contains no SCC
mutation or detailed RBAC simulation. There are no additional campaigns or
missions to migrate. The terminal is a bounded simulation, not a general shell.

## Milestones and acceptance

1. Preserve the original and capture automated browser flows/screenshots.
2. Extract CSS, markup and behavior into Vite/TypeScript modules without changing
   behavior; typecheck/build and rerun the exact browser proof.
3. Centralize simulation operations and deterministic domain events, retain
   audit events and derive security/traffic views from the same state. Correct
   unsupported command acceptance and additive NetworkPolicy behavior within
   existing operations, with focused tests.
4. Run production-build browser gameplay, compare deterministic screenshots,
   inspect rendered output, and document limits and local run commands.

The browser proof in `tests/gameplay.py` drives actual keyboard/canvas/DOM input.
Its controlled animation clock makes screenshots reproducible. Baseline receipts
and four screenshots live in `artifacts/baseline/`. It verifies movement, trace,
Pod interaction, NPC dialogue, RHACS, caseboard, history/autocomplete, all five
clues, removal/rollout, DNS failure under deny-all, recovery, positive/negative
connectivity, B and S endings, restart and mobile rendering.

The migration milestones above were completed before the subsequently approved
ROADSHOW visual/story redesign. The preserved legacy game remains the historical
reference, while current presentation follows the user’s evolving RPG direction.

## Extracted module ownership

| Directory         | Responsibility                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `src/game/`       | Canvas rendering, animation loop, movement, input wiring and presentation flags          |
| `src/world/`      | Cluster locations and interactive objects, proximity actions and Trace Vision            |
| `src/simulation/` | Shared state, Deployment/Pods/policies, resource manifests, operations and domain events |
| `src/terminal/`   | Bastion/Pod shell, command grammar, execution, completion/history                        |
| `src/characters/` | Contextual Rhea/Mira radio dialogue                                                      |
| `src/missions/`   | Ghost Route completion, grading and replay                                               |
| `src/security/`   | Historic evidence and current finding projection                                         |
| `src/ui/`         | Original styles, typed DOM lookup, HUD, overlays and event-to-view updates               |
| `public/assets/`  | Future static assets; the original needs none                                            |
| `tests/`          | Domain/grammar tests, real browser gameplay, browser semantics, screenshot comparison    |

`src/main.ts` registers input and simulation view listeners, initializes the HUD,
then starts the existing animation loop. UI functions retain some direct module
dependencies from the original; there are no initialization-time cross-module
calls. Domain operations have no DOM, Canvas, browser-clock or UI dependencies
and are tested in Node independently of the game.

## Shared state and events

The single live `S` binding owns infrastructure, progression, evidence and
verification. Reset replaces it; imports continue to read the current instance.
`G` contains presentation flags, input and camera state only. `S.env`, `S.podRev`
and `S.policy` are derived compatibility getters used by the extracted views.

Environment removal updates the Deployment, replaces both Pods, completes a
synchronous offline rollout, invalidates prior proof, and reevaluates current
security findings. These operations emit `deployment.updated`, `pods.replaced`,
`rollout.completed`, and `security.reevaluated` in that order. Policy application,
evidence collection and connectivity tests also emit events. Each immutable
event is retained in `S.audit` with an actor, a monotonically increasing sequence
and a deterministic scenario timestamp. Replay starts a new audit history.

The HUD subscribes to completed domain changes; the animated world and terminal
read the same state. RHACS detail distinguishes the historical observed deviation
from the current outbound-flow status. Evidence remains a historic case record;
current findings separately track configuration, egress, active deviation and
dependency impact. No event relies on real elapsed time or random values.

## Deliberate correctness repairs

Selecting egress NetworkPolicies combine their allowed traffic, regardless of
application order, as specified in the [Kubernetes NetworkPolicy documentation](https://kubernetes.io/docs/concepts/services-networking/network-policies/).
Applying default-deny after `payment-egress` therefore preserves DNS/ledger
access. Lists contain only applied policies. The original deny-first outage and
recovery gameplay still works.

The bounded terminal grammar rejects unknown options, unknown workloads,
unimplemented mutations and arbitrary RBAC queries. The implemented RBAC question
is `oc auth can-i patch deployments -n payments`. Pod tests require exact hosts,
ports and supported syntax. JSON output is JSON, and named policy YAML inspection
returns its actual simulated manifest. Unsupported syntax returns an explicit
error and never changes infrastructure.

## Original episode limits at migration completion

This remains one offline episode. Rollouts finish synchronously, Pods are always
Ready after replacement, and manifests are predefined. The shell does not run
processes, edit files, implement arbitrary YAML, connect to OpenShift, simulate
all Kubernetes resources, or implement complete RBAC/SCC behavior. Audit history
is in memory and resets on replay/page reload. No new campaign, editor, terminal
library, multiplayer or backend was added.

## Verification evidence

`npm test` covers event order, replacement Pods, finding reevaluation, idempotent
environment removal, policy union in both orders, stale-proof invalidation,
deterministic audit replay, reset and rejection of unsupported grammar/destinations.
`tests/semantics.py` verifies corrected behavior through the production terminal.
`tests/gameplay.py` runs the original B/S completion paths through real browser
input. `tests/compare_screenshots.py` requires exact opening/mobile pixels and at
most 0.1 of 255 mean error per channel for investigation/debrief backdrop edges.
The game clock is controlled, and browser painting is explicitly synchronized
before screenshot capture; the original baseline was recaptured using this rule.

## OpenShift 4.22 laboratory milestone

After migration verification, the requested cluster laboratory was added after the original migration. The original incident completion remains intact. `S.cluster` owns
resource objects, namespace/context, identities, RoleBindings, supported SCCs,
virtual manifests, controller events and API audit records. Resource operations
emit `cluster.request` domain events. Original payment changes are bridged into
the same API audit stream and exposed as current resource snapshots.

`cluster-api.ts` owns CRUD and the simplified Deployment controller;
`security/rbac.ts` checks permissions and stored Role/RoleBinding grants;
`security/scc.ts` evaluates supported admission constraints. Grants are read from
RoleBindings rather than a separate permission cache. Accepted Pods carry their
SCC annotation and generated security context. Controller admission failures are
recorded separately from successful Deployment requests and application runtime
failures.

`terminal/lexer.ts` parses quoted commands/pipelines; `cluster-shell.ts` dispatches
against live resources. The preserved episode interpreter continues to own its
original operations. `query-worker.ts` runs jq 1.8.2 WASM and a locally compiled
Go text/template WASM helper. Workers time out and terminate independently of
the game's render loop. The Go source and rebuild script are in `tools/template`
and `tools/build-template.sh`; the shipped Go runtime includes its license.

`tests/cluster.test.mjs` covers RBAC/admission separation, default v3 generation,
custom/anyuid grants and revocation, scope isolation, runtime versus admission
failures, unknown image handling, and quote parsing. `tests/cluster_browser.py`
exercises the actual production terminal, WASM assets, rich jq filters, Go range
and index templates, SCC remediation, audit investigation and custom manifest CRUD.
The original gameplay paths remain regression gates. Historical pixel checks
are available as `test:visual:legacy`; they describe the migration baseline,
not the subsequently approved ROADSHOW artwork and story interface.

See `CLUSTER_GUIDE.md` for playable exercises and explicit fidelity boundaries.
This milestone does not claim complete oc coverage or live OpenShift 4.22 error
parity. Unsupported features report simulator limitations instead of manufactured
policy denials.

## Offline and persistence milestone

`simulation/snapshot.ts` serializes versioned portable checkpoints, restores Sets
and reconstructs computed getters/findings. `simulation/persistence.ts` owns
IndexedDB, ordered asynchronous writes, event/command checkpoints and periodic
movement checkpoints. Startup restores `S` before controls/rendering begin;
presentation flags start clean. Completed incidents reconstruct the original
debrief. Replay writes a fresh incident. `terminal/progress-commands.ts` exposes
save status and local JSON export/import; invalid imports preserve live state.
There is one current save per origin; concurrent tabs do not coordinate writes.

`tools/offline-build.ts` hashes and inventories the actual production output to
generate a scoped, versioned service worker. Installation precaches all static
assets, including engines not yet used. Activation removes old scoped caches;
updates wait for existing pages to close, so an active page retains its matching
asset version. `game/offline.ts` reports installation readiness. Development mode
skips service workers. Offline play requires one successful initial installation
over HTTPS/localhost and retained browser caches.

WASM is reserved for the actual jq and Go-template runtimes. Each engine reuses
its compiled worker between queries. Queueing and a five-second timeout isolate
queries from Canvas rendering; a timed-out worker is discarded. The graphical
game stays on its existing small Canvas renderer. No remote tool service or CDN
is used.

`tests/snapshot.test.mjs` verifies restore coherence and invalid import rejection.
`tests/offline_browser.py` installs the production cache, closes/restarts Chromium
with the same disk profile, disables its network before navigation, and uses both
WASM engines for the first time offline. It checks incident/resources/grants/files,
audit/history restoration, portable backup import and hung-query recovery, and
records local cold/warm timings including real terminal input and autosave.

The framework lab/source links and current-versus-future learning coverage are
maintained in `CLUSTER_GUIDE.md`; older draft examples are interpreted against
OpenShift 4.22 documentation, rather than copied as runtime specifications.


## ROADSHOW story, world and health milestone

`world/scene-model.ts` defines eight scenes: district, trusted SOC/operator hub,
untrusted external network, cluster corridor, two worker rooms, operations and
records archive. Scene changes restore a reachable floor spawn and checkpoint
visited rooms. Convex floor projection prevents crossing walls. Canvas resolution
matches its CSS aspect ratio; a camera crops the scene rather than stretching
characters and labels. Genuine raster artwork is preloaded once. Player and Mira
use generated animation atlases with per-frame ground pivots and fixed scale.
Their limb animation is approximate, not a rigged or motion-captured character.

`world/locations.ts` derives node-local Pod objects from actual scheduling fields.
Deployments are controllers with no floor sprite; namespaces label logical tenant
boundaries across both workers. Only the SOC bastion is a terminal object.
`terminal/shell.ts` enforces physical proximity independently of keyboard/button
controls. Its modal blocks world input, preserves terminal history, and closes
when the player leaves. Logs/config/network/RBAC shortcut tabs were removed;
commands operate on the same existing simulation.

`world/story.ts` owns physical access predicates and discovery bookkeeping.
Rhea’s report supplies RHACS evidence. Mira issues the worker investigation pass;
the maintenance locker supplies the archive keycard. These affect story doors
only, never RBAC/SCC. Kai and Vale provide corroboratable leads. `missions/story.ts`
ships read-only case files through the VFS. `STORY.md` describes the implemented
chapter. Incident win conditions, security evidence and S/A/B grades remain
resource/verification driven.

`S.story` checkpoints passes, discoveries, personal notes and outage acknowledgement.
Both notebook inputs mirror this one string; editable fields suppress game keys.
Snapshot decoding supplies defaults for older saves and validates scene/item IDs.
No save format version bump or local database-key change is required.

`simulation/health.ts` projects checkout dependencies, Pod readiness and node
status from S. `ui/health-map.ts` renders application reachability and scheduled
Pod/node views. Default-deny makes checkout DEGRADED while both payment Pods and
nodes remain Ready; restored dependency permissions clear the persistent impact.
The chart is a live data visualization, not a replacement for artwork or icons.
`ui/simulation-views.ts` coalesces mutation events into readable change notices.

`world/reactions.ts` implements Mira’s response to an initial default-deny outage.
It closes the console, animates her approach, then opens consequence dialogue.
Reaction movement lives in G; impact, disruption count and acknowledgement live
in S. The short arrival prevents room changes until she reaches the investigator.
A resumed unacknowledged outage restarts the reaction at the operator hub.

Current verification includes tests for access gates, notes/checkpoint compatibility,
physical terminal boundaries, NPC interviews, actual Mira movement, outage and
recovery, responsive layouts and both incident endings. Offline browser restart
checks all artwork, fonts and both query engines. Original migration pixel gates
are not claimed as acceptance for the later user-approved redesign.
