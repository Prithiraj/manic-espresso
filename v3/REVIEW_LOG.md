# V3 Slice Review Log

This file records the visual gate for each Blender/Three.js slice. A slice is not marked approved merely because it builds.

## Review scale

Each slice is reviewed against:

- composition / hierarchy
- camera / perspective
- lighting direction
- cast and contact shadows
- material separation
- geometry fidelity
- relationship to real Manic photography
- responsive framing
- reduced-motion/static state
- performance / loading

## Slice status

| Slice | Static build | Desktop review | Mobile review | Motion review | Performance | Status |
|---|---|---|---|---|---|---|
| Hero ceramic | Pass | Pass | Pass | Pending | Pass | **Static gate passed** |
| Proof tokens | Not started | — | — | — | — | Deferred |
| Why Manic still lifes | Not started | — | — | — | — | Planned |
| Menu exploded breakfast | Not started | — | — | — | — | Planned |
| Café miniature cutaway | Not started | — | — | — | — | Planned |
| Review paper | Not started | — | — | — | — | Planned |
| Gallery photo table | Not started | — | — | — | — | Planned |
| Visit location token | Not started | — | — | — | — | Planned |
| Final ceramic callback | Not started | — | — | — | — | Planned |

---

## Hero ceramic — review notes

### Intended static frame

- HTML headline and conversion actions remain dominant on the left.
- Real Manic interior/coffee/breakfast photography remains visible on the right.
- Blender ceramic set occupies the lower-right foreground, creating a spatial diagonal toward the image collage.
- The cup should feel crafted rather than generated from obvious primitives.
- Saucer and cup contact must be believable before any lift animation is enabled.
- Camera should reveal coffee surface and cup side simultaneously without wide-angle distortion.

### Blender object list

- custom lathed cup shell with hollow interior
- separate coffee/crema surface
- custom lathed saucer
- curved spoon
- folded napkin
- restrained floral detail
- thin plinth/table slice for grounding

### Lighting target

One warm key from upper-left/front-left, weak cool-neutral fill, soft environmental contribution. Only the key casts shadows.

### QA run

Static QA completed successfully after fixing the Ubuntu Blender package's missing `numpy` dependency. CI now installs Blender 4.0.2 plus `python3-numpy`, generates the GLB headlessly, builds the Vite production bundle, and renders deterministic reduced-motion screenshots.

Artifacts reviewed:

- `hero-desktop-1600x1000.png`
- `hero-mobile-390x844.png`
- generated `manic-hero.glb` (~636 KB before further compression work)

### Desktop review — PASS

- **Composition:** The headline remains the dominant mass; the Blender set sits in the right-hand photo field instead of becoming a centred 3D product demo.
- **Perspective:** Cup top and side are both readable. Perspective is restrained and does not feel game-like.
- **Grounding:** Cup/saucer/plinth relationship reads clearly. Broad plinth and directional shadow establish physical weight.
- **Materials:** Ceramic, coffee, brass spoon, and paper napkin separate adequately under the warm key.
- **Photography relationship:** Interior, coffee, and pancake images remain important and visibly real; Blender behaves as a foreground layer around them.
- **Geometry:** The custom cup silhouette and curved handle no longer read as an obvious default primitive.

### Mobile review — PASS WITH WATCH ITEM

- Headline/actions remain readable and conversion-first.
- One strong real interior image plus the coffee image are preserved; the pancake card is correctly removed.
- The Blender model begins lower in the first scroll, so the first viewport remains text-led. This is acceptable for the static gate and creates a natural reveal, but the motion pass should bring the ceramic set upward slightly as the user reaches the lower half of the hero rather than leaving the effect too late.

### Fallback review — PASS

Playwright explicitly aborts `models/manic-hero.glb`; the real coffee fallback remains visible and the directions CTA remains functional. No essential content depends on WebGL.

### Performance review — PASS FOR SLICE 01

- Generated GLB is small enough for the first slice (~636 KB) before compression.
- Rendering is static/off-cycle after resize during this gate.
- DPR is capped by breakpoint.
- Only one shadow-casting key light is used.

### Static verdict

**Approved for the Hero motion pass.**

### Motion-pass requirements

- Scrub the Blender-authored `ACT_HERO_CUP_LIFT` / spoon action rather than inventing a full-world rotation.
- Move camera through a shallow dolly/arc only.
- Keep saucer/plinth visually grounded as the cup lifts.
- On mobile, bias motion upward enough that the 3D still life becomes visible before the hero fully exits.
- Reduced motion must remain exactly on the approved static frame.
