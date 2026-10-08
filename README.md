# NEXUS / Ghost Route

A playable OpenShift security adventure, migrated from its original HTML into
Vite and TypeScript. Walk through the cluster, investigate an anomalous payment
service, use the simulated terminal, remediate the cause and verify connectivity.

This project lives in `security-game`. The preserved original is
`legacy/nexus_ghost_route_game.html`.

## Run

Requires Node.js 22.12 or later and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Move with WASD/arrows or click the world. E interacts,
Space toggles Trace Vision, and T opens the terminal. Type `help` for implemented
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
npm run test:visual
```

To recapture the original baseline, serve the repository at port 4173 and run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
# In another terminal:
python3 tests/gameplay.py http://127.0.0.1:4173/legacy/nexus_ghost_route_game.html artifacts/baseline
```

Visual comparisons require baseline and migrated screenshots captured with the
same Chromium version, OS fonts and display scale. Browser receipts are written
to `artifacts/migrated/`; the retained baseline is in `artifacts/baseline/`.

See [ARCHITECTURE.md](ARCHITECTURE.md) for ownership, migration evidence and limits.
