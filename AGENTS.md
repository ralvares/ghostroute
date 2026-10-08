# NEXUS project rules

This repository lives in `security-game`. The original playable game is
`legacy/nexus_ghost_route_game.html`. Preserve that file as the baseline.

1. Never remove existing functionality without explicit user approval.
2. Preserve working gameplay and its visual presentation; do not redesign it.
3. Keep the graphical world; do not replace it with a dashboard.
4. Maintain a working build throughout incremental migration.
5. Commit each completed, verified migration milestone.
6. Finish and verify migration before implementing new missions.
7. Keep security simulations deterministic and reproducible.
8. Document module ownership and state/event contracts in `ARCHITECTURE.md`.
9. Keep terminal, world, and security views on the same simulation state.
10. Verify gameplay with browser interaction and screenshots, not code review alone.
11. Use Vite and TypeScript. Introduce neither React nor Phaser during migration.
12. Reject unsupported commands explicitly; never invent successful operations.
13. Keep Kubernetes/OpenShift simulation semantics accurate within the documented scope.

The session references `RTK.md` and `STYLE.md`; neither was available at migration
start. Read them if they become available. Do not invent their contents.
