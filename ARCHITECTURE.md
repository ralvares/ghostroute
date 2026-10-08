# Ghost Route migration

## Original inventory and dependencies

The preserved 60 KB HTML uses DOM/CSS overlays and a native Canvas 2D world.
It has no dependencies, external assets, audio, persistence, backend or network
access. Graphics (racks, Pods, avatar, stations, NPCs, moving network signals)
are drawn procedurally. Responsive CSS and a horizontal mobile camera preserve
the world on narrow screens; reduced-motion preferences are recognized.

| Responsibility | Existing behavior | Dependencies |
| --- | --- | --- |
| World/rendering | Two worker nodes, two payment replicas, ledger, RHACS and Ops stations, external edge; animation and labels | Canvas, positions, shared state, Trace Vision |
| Movement/input | WASD/arrows, click-to-walk, proximity prompt, E interaction, Space trace, T terminal | Frame clock, objects, overlay focus/blocking |
| Characters | Rhea analyst and Mira engineer, contextual radio conversations | Evidence, environment configuration, network policy |
| Terminal | Bastion and Pod shells, command history, Tab/Right suggestions, Ctrl+L/R, files, help and errors | State, clues, simulated resources, UI |
| Simulation | Deployment environment removal, revision/Pod replacement, logs, egress policies, DNS and ledger/external tests | Command interpreter and shared state |
| Security | RHACS baseline deviation, five correlated evidence clues, caseboard, trace paths | World interaction, logs/config/policy reads |
| Mission | Investigation, root-cause removal, egress restriction, rollout and positive/negative proof; S/A/B grade, outage penalty, replay | Evidence and state/verification sets |
| UI | Briefing, HUD, toast/radio, details, caseboard, terminal, debrief | Shared state and actions |

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

No new missions or interface redesign are part of this migration.

## Extracted module ownership

| Directory | Responsibility |
| --- | --- |
| `src/game/` | Canvas rendering, animation loop, movement, input wiring and presentation flags |
| `src/world/` | Cluster locations and interactive objects, proximity actions and Trace Vision |
| `src/simulation/` | Shared state, Deployment/Pods/policies, resource manifests, operations and domain events |
| `src/terminal/` | Bastion/Pod shell, command grammar, execution, completion/history |
| `src/characters/` | Contextual Rhea/Mira radio dialogue |
| `src/missions/` | Ghost Route completion, grading and replay |
| `src/security/` | Historic evidence and current finding projection |
| `src/ui/` | Original styles, typed DOM lookup, HUD, overlays and event-to-view updates |
| `public/assets/` | Future static assets; the original needs none |
| `tests/` | Domain/grammar tests, real browser gameplay, browser semantics, screenshot comparison |

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

## Limits

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
