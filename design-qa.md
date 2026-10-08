# ROADSHOW design QA

final result: passed

Reviewed 2026-10-08 against the supplied visual and the user's subsequent story,
physical-bastion, notebook, movement, room hierarchy, and health-map requirements.
No actionable P0/P1/P2 findings remain in those reviewed states. This is an
intentional evolution of the reference, not a pixel-identical reproduction.

## Comparison artifacts and normalization

- Source visual truth: /var/folders/qk/0827h5bd6dqfknm1m8trtfvr0000gn/T/codex-clipboard-8c9dfffc-9e92-4f92-9922-cbd348504053.png.
- Implementation: http://127.0.0.1:4178/ production preview.
- Full-view captures: artifacts/roadshow/iab-story-desktop.png,
  iab-soc-final.png, and iab-mira-final.png.
- Console: artifacts/roadshow/iab-bastion-final.png and
  iab-bastion-mobile-final.png.
- Focused regions: artifacts/roadshow/iab-header-final.png and
  iab-health-final.png.
- Mobile world: artifacts/roadshow/iab-world-mobile-final.png.
- Source and desktop implementation: 1536 × 1024 pixels, 1536 × 1024 CSS viewport,
  density 1. No scaling or browser frame normalization needed.
- Mobile: 390 × 844 CSS viewport, density 1; the console capture is 390 × 844.
  Full-page world capture includes the intentionally stacked notebook and health
  map below the fold. The reference does not specify a mobile layout.
- Header crop: 1536 × 126. Health crop: 380 × 214. Crops preserve native density.

The source and final screenshots were opened together in the same comparison
input. The full-view pass compared isometric scene dominance, dark surfaces,
red fedora identity, hierarchy, readable labels, mission panel and investigation
controls. A second combined input paired the source with the native header and
health crops and the mobile world. The terminal and mobile console were also
examined at their native dimensions in the combined reference input.

The source shows a single platform with a permanent terminal and shortcut tabs.
The implementation captures different story locations and a triggered outage.
Those state differences are intentional: the user explicitly requested separate
cluster buildings/worker rooms, people to interview, a physical bastion, removal
of the shortcut menus, notes, and visible consequences. The healthy reference is
not used as an exact color target for the degraded state.

## Required fidelity surfaces

- **Fonts and typography:** bundled Inter keeps labels and body text readable;
  monospace remains confined to console, notes and technical labels. Header,
  mission title and dialogue have clear hierarchy. Native focused views confirm
  readable wrapping and aligned controls. The font is an approved redesign, not
  a claim about the unidentified source font.
- **Spacing and layout:** world remains the dominant desktop region. Notes and
  live health have separate space; the terminal uses a modal with adjacent notes.
  Mobile stacks regions rather than compressing the desktop grid. Automated
  geometry checks found no horizontal page overflow or intersecting notebook,
  map and scene at 1536, 1024 and 390 pixels. The mobile console fits its viewport;
  wide command output scrolls within the console.
- **Colors and tokens:** graphite, off-white and jade distinguish ordinary
  controls from red alerts; degraded checkout has persistent text and a banner.
  Dependency labels explicitly say allowed/blocked, so color is not the only
  status channel. No formal WCAG contrast audit is claimed.
- **Image quality:** generated raster backgrounds, transparent characters,
  portraits, props and atlas frames preserve the reference's night-time
  isometric art direction. The renderer uses uniform scale and floor pivots.
  The small SVG health chart is a live data visualization, not replacement art.
  Assets and licenses are documented in public/art/README.md.
- **Copy/content:** ROADSHOW branding; four distinct witness roles; logical
  evidence and physical key/pass acquisition; accurate node-local Pods; explicit
  distinction between physical doors and API authorization. Checkout failure
  does not falsely report dead Pods or Nodes. Credential attribution is not
  presented as identification of a person.

## Findings and comparison history

Earlier scope comparisons identified distorted characters/click coordinates,
small typography, crowded panels, sparse worker scenes and static movement.
Fixes introduced uniform camera cropping, local fonts, separate rooms and
generated walk/run atlases. iab-lobby-round1.png, the worker captures and final
desktop captures provide the subsequent visual evidence.

The health pass found filled network-flow shapes and stale side-panel messaging.
The chart now renders unfilled links; status uses the shared simulation and
mutation notifications. iab-degraded-round1.png, iab-mira-final.png and
iab-health-final.png show blocked versus restored dependencies.

The user's later flow request superseded the permanent terminal, shortcut tabs
and profile panel. The final pass verifies a single physical bastion, modal
console, notebook and fewer navigation items. The final console and mobile
captures confirm the new layout. No additional visual changes were needed after
this final comparison.

## Interaction evidence

tests/rpg_browser.py verifies worker access gates, witness interviews, locker
keycard, archive evidence, recorded leads, scene transitions, actual Mira position
changes, console interruption, recovery, and fresh-page persistence. It also
checks responsive geometry and the fitted mobile console.

Manual in-app-browser review verified Rhea's report, bastion interaction,
oc get pods, notebook mirroring, default-deny confrontation, recovery through
the actual manifest, console exit and the mobile layout. Captured console
warnings/errors: none.

The build and 23 unit tests passed. Original B/S endings, supported command
semantics, SCC/RBAC labs, real jq/Go WASM queries and offline browser restart are
retained in artifacts/roadshow-verification.json. The final subpath build also
passed an offline restart test.

## Open questions and follow-up polish

- P3: generated limb animation remains approximate; a professionally rigged
  character would improve motion quality without changing simulation behavior.
- P3: small NPC art and scene labels are less detailed on mobile; interaction
  prompts and full-size interview panels preserve the actionable information.
- No full assistive-technology or 200% zoom audit was performed. Keyboard,
  textarea focus, reduced-motion reaction handling and responsive geometry were
  reviewed; this is not a complete accessibility certification.
- The Impeccable mechanical detector reported a degraded regex fallback rather
  than an AST HTML analysis. Its generic font/border/tab flags were considered
  against the explicit game brief; this is not a clean automated audit claim.
- First offline installation needs network access. An existing tab can retain
  an older cache after rebuilding; close old game tabs to activate the new
  production assets. Notes and progress are stored per origin.

## Implementation checklist

- [x] Genuine artwork and typography present in the rendered game.
- [x] Node/Pod hierarchy and worker rooms support the story.
- [x] Bastion-only terminal and locally saved notes verified.
- [x] Default-deny consequence, Mira approach and recovery verified.
- [x] Full-view and focused reference comparisons complete.
- [x] Desktop, tablet and mobile behavior checked.
- [x] Evidence, limitations and final result recorded.

## Campaign publication review — 2026-10-08

final result: passed

This pass covers the 27-chapter journey, chapter health, retained reports and
GitHub Pages static-path build. Original reference and native captures were
reviewed together: artifacts/campaign/iab-world-desktop.png and
iab-journey-desktop.png at 1536 × 1024, plus journey-mobile.png at 390 × 844
CSS viewport (full-page capture). No source scaling was applied. State differs
intentionally: the reference has a permanent console; this game uses the user's
physical bastion and changing investigation rooms.

The first Journey review found its 27 rows pushed the return control off screen.
The list now scrolls in a bounded region, keeping the return control visible on
desktop and mobile. Typography, fonts, colors, spacing, icon artwork and live
copy preserve the approved scene-led design. These changes need no new generated
art. The campaign reuses existing room art for different districts/tenants;
it does not claim 27 distinct background assets.

The manual browser pass opened Journey, checked the locked/current entries,
returned to the world and physically entered RHACS Central. Automated real-input
browser verification completed every chapter, exercised physical witness and
archive interactions, Tab file completion, case gates and actual bastion APIs.
It checked degraded tenant health with the Cluster map selected, final Journal
reports, mobile Journey/console, offline resume and export. All 32 unit checks
and the original gameplay, command, SCC/RBAC and RPG layout regressions passed.
The exact /ghostroute/ static path also passed offline restart and both local
WASM query engines. Receipts are in artifacts/campaign-verification.json.

No actionable P0/P1/P2 layout findings remain in reviewed states. Existing P3
animation/art and accessibility coverage limits remain. Advanced use cases are
explicit recorded fixture evaluations, not real provider/operator execution;
CAMPAIGN.md maps each chapter to source labs and states the boundaries.

## Final continuity, labels and cast pass — 2026-10-08

Status: passed for reviewed states. The supplied reference, native desktop,
worker-room and 390px mobile captures were reviewed together at their original
viewport sizes. World cards measure their text, avoid sprite/actor/overlay and
card collisions, stay inside the camera and use larger mobile fonts. Worker
rooms show two tenant Pod sprites plus the original application, with the
full persistent workload list behind the register. No unlabelled overflow
Pod sprites are drawn.

The header displays the current chapter name only. Mira has one persisted
location; her dependency board is a prop. Rhea and Kai no longer have second
physical appearances. The native release check confirms control-01 in the
Cluster map. Final completion shows a verified handover and healthy payments
instead of an unfinished investigation prompt.

The runtime case now retains its observed diagnosis and requires deletion
of the failed Pod. First-case cause review, original bot permission repair,
release-input review, and final live-control drift rejection are exercised
through real browser commands. All 43 unit checks pass. Every chapter is
played by the automated browser; manual visual review covers selected scenes
and responsive states, not every chapter. No zero-bug claim is made.

## Bastion pager and API pass — 2026-10-08

Status: passed in reviewed desktop and 390px mobile states. Native browser
interaction confirmed the exact reported audit query, readable JSON in less,
page sizing using available height, literal search and q returning to the prompt.
The terminal remains available only at the bastion; notes stay alongside it.
Automated input checks cover scrolling, search failure/cancel/repeat, Escape,
mobile controls and reopening the bastion after closing a pager.

51 unit checks, the 27-chapter real-input journey, original outage/recovery/endings,
SCC/RBAC browser checks, exact jq bytes and offline cold restart pass. The update
regression also checks that a new cached build activates with an old tab open,
retaining notes/files and working offline. The shared REST API is documented as
bounded; no full OpenShift/Linux compatibility or zero-bug claim is made.
