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
