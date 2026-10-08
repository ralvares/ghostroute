# ROADSHOW artwork

Original raster assets generated with the built-in ImageGen tool using the
user-supplied cyber-noir isometric reference and subsequent cinematic
art direction. No franchise characters are used. Backgrounds, actors,
workload sprites and props are individual assets; interactive text, states and
controls remain live UI. WebP files are local and included in offline precaching.

The backgrounds share a roughly 16:9 elevated cutaway camera. `rendering.ts`
projects them into one 1180x650 world and uses a uniform viewport scale/camera.
Pod objects reflect actual simulated scheduling; worker/building artwork is not
used to invent Deployment placement.

`operator-walk.webp` is an eight-frame atlas; `mira-run.webp` has four frames.
Their JSON metadata contains per-cell source rectangles and support-foot pivots.
The runtime uses one fixed scale and pins feet to the floor instead of bobbing an
entire still image. Generated contact alternation remains approximate; these are
not rigged or motion-captured animations. NPC images are genuinely transparent.

Rhea, Mira, Kai and Vale are original fictional personas. The physical keycard and
records folder are props, not API credentials or security controls.
