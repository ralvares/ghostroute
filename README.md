# The Ghost Route — OpenShift Security Adventure

A 27-chapter OpenShift security adventure in seven connected acts, migrated from its original HTML into
Vite and TypeScript. Interview witnesses, collect access passes and evidence, then return to the
bastion to investigate an anomalous payment service. Your changes affect both
customer checkout and the story. The header shows the current chapter name; there is no separate game brand.

All chapters evolve the same `prod-east` cluster. Chapter 01 must explain the
release job, API caller and weak links. Chapters 03 and 18 repair the original
bot permissions and unreviewed import; the final handover checks all earlier
controls against current state.

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
python3 tests/campaign_browser.py http://127.0.0.1:4174/
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

See [CAMPAIGN.md](CAMPAIGN.md) for the full journey and framework-lab coverage.
Finish the original case and choose **Continue journey**. The Journey menu shows
what is active, closed and locked. At the bastion, use `case status` and `case hint`;
read the current `campaign/XX/briefing.txt`, meet its witnesses, find its archive
dossier, and verify both tests before `case conclude`. Resources, notes and
reports carry into the next chapter.

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

## GitHub Pages

The deployed game is HTML, JavaScript, CSS, artwork and WASM. TypeScript/Vite are
build tools only; the browser needs no Node server or backend. GitHub Pages can
serve the complete `dist` folder. For the publication repository `ghostroute`, build:

```sh
npm ci
npm test
npm run build -- --base=/ghostroute/
```

The included `.github/workflows/pages.yml` installs, tests, builds with the
repository base path and publishes `dist` on a push to master/main. Pages uses
GitHub Actions as its source. The published site is
[ralvares.github.io/ghostroute](https://ralvares.github.io/ghostroute/). Use `/` as the base for a
user site or custom domain. The repository name determines the project-site
path; the local folder name does not. See the [official Vite Pages guide](https://vite.dev/guide/static-deploy.html#github-pages).

Progress is local to each browser/origin, with JSON export/import for transfer;
there is no cloud synchronization. Offline play requires the initial asset cache
to finish (`game status`). Serve the generated files
over HTTPS or localhost; opening `index.html` through `file://` does not install
the offline cache.

After rebuilding an installed preview, close its existing game tabs so the new
offline worker can activate. Local progress remains in IndexedDB. Use `game export`
to move a save to another browser or origin; changing a localhost port creates a
separate browser origin.
