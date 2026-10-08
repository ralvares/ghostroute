# ROADSHOW / Ghost Route

A playable OpenShift security adventure, migrated from its original HTML into
Vite and TypeScript. Interview witnesses, collect access passes and evidence, then return to the
bastion to investigate an anomalous payment service. Your changes affect both
customer checkout and the story.

This project lives in `security-game`. The preserved original is
`legacy/nexus_ghost_route_game.html`.

## Run

Requires Node.js 22.12 or later and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Move with WASD/arrows or click the world. E interacts,
Space toggles Trace Vision near a workload. Walk up to the bastion at RHACS
Central and interact (E or nearby T) to open the terminal panel. Type `help` for implemented
commands. Commands operate on an offline simulation and never contact a cluster.

## Verify

```sh
npm test
npm run build
npm run preview
```

The production preview runs at http://127.0.0.1:4174. In another terminal, install
the browser-test dependencies once and run the checks:

```sh
python3 -m pip install -r tests/requirements.txt
python3 -m playwright install chromium
npm run test:browser
npm run test:semantics
npm run test:cluster
npm run test:offline
npm run test:rpg
```

To recapture the original baseline, serve the repository at port 4173 and run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
# In another terminal:
python3 tests/gameplay.py http://127.0.0.1:4173/legacy/nexus_ghost_route_game.html artifacts/baseline
```

The original migration pixel comparison is historical (`test:visual:legacy`);
the user subsequently approved ROADSHOW artwork and the RPG redesign. Current
scene/notes/bastion/health screenshots and receipts are in `artifacts/roadshow/`.
The original gameplay baseline remains in `artifacts/baseline/`.

See [STORY.md](STORY.md) for the implemented first chapter: Rhea’s report, Mira’s
worker access pass, Kai’s release clues, Vale’s locked audit archive, and Mira’s
reaction to a checkout outage. Notes persist locally and follow you into the
bastion. The live health map separates dependency impact from node/Pod readiness.

See [ARCHITECTURE.md](ARCHITECTURE.md) for ownership, migration evidence and limits.

The OpenShift 4.22 laboratory adds resource operations, RBAC/SCC checks,
deterministic audit logs, real jq and Go templates. See
[CLUSTER_GUIDE.md](CLUSTER_GUIDE.md), or type `cat lab.txt` in the game terminal.

The production build installs an offline cache, including the local WASM tools.
Type `game status` to check readiness before disconnecting. Progress saves
automatically in this browser; reload resumes the case. `game export` downloads a
portable backup, and `game import` restores one. Restart/replay clears the current
progress. Development mode does not install the offline cache.

For a static host under a path (for example GitHub Pages), build with its base:
`npm run build -- --base=/security-game/`. Serve the generated `dist` directory
over HTTPS or localhost; opening `index.html` through `file://` does not install
the offline cache.

After rebuilding an installed preview, close its existing game tabs so the new
offline worker can activate. Local progress remains in IndexedDB. Use `game export`
to move a save to another browser or origin; changing a localhost port creates a
separate browser origin.
