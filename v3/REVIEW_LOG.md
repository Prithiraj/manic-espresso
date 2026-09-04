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
| Hero ceramic | Pass | Pass | Pass | Pass | Pass | **Approved** |
| Proof tokens | Not started | — | — | — | — | Deferred |
| Why Manic still lifes | Not started | — | — | — | — | Planned |
| Menu exploded breakfast | In progress | Pending | Pending | Pending | Pending | **Building next** |
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

Static QA completed successfully after fixing the Ubuntu Blender package's missing `numpy` dependency. CI installs Blender 4.0.2 plus `python3-numpy`, generates the GLB headlessly, builds the Vite production bundle, and renders deterministic reduced-motion screenshots.

Artifacts reviewed:

- `hero-desktop-1600x1000.png`
- `hero-mobile-390x844.png`
- `hero-scroll-mid-1600x1000.png`
- generated `manic-hero.glb` (~629 KiB before further compression work)

### Desktop static review — PASS

- **Composition:** The headline remains the dominant mass; the Blender set sits in the right-hand photo field instead of becoming a centred 3D product demo.
- **Perspective:** Cup top and side are both readable. Perspective is restrained and does not feel game-like.
- **Grounding:** Cup/saucer/plinth relationship reads clearly. Broad plinth and directional shadow establish physical weight.
- **Materials:** Ceramic, coffee, brass spoon, and paper napkin separate adequately under the warm key.
- **Photography relationship:** Interior, coffee, and pancake images remain important and visibly real; Blender behaves as a foreground layer around them.
- **Geometry:** The custom cup silhouette and curved handle no longer read as an obvious default primitive.

### Mobile static review — PASS

- Headline/actions remain readable and conversion-first.
- One strong real interior image plus the coffee image are preserved; the pancake card is removed at the mobile breakpoint.
- The Blender set begins in the lower part of the first scroll, keeping the first viewport text-led while still becoming visible before the Hero exits.

### Fallback review — PASS

Playwright explicitly aborts `models/manic-hero.glb`; the real coffee fallback remains visible and the directions CTA remains functional. No essential content depends on WebGL.

### Performance review — PASS FOR SLICE 01

- Generated GLB is ~629 KiB before compression.
- DPR is capped by breakpoint.
- Only one shadow-casting key light is used.
- IntersectionObserver stops the animation loop once the Hero leaves view.

### Hero motion review — PASS

The motion test explicitly confirms the exported Blender actions `ACT_HERO_CUP_LIFT` and `ACT_HERO_SPOON_SHIFT` are present and that the rendered WebGL frame changes after deterministic scrolling.

Visual review of `hero-scroll-mid-1600x1000.png`:

- **Blender motion is the object motion source:** Three.js scrubs the Blender animation clips instead of rotating the complete scene.
- **Camera choreography:** the camera uses a shallow dolly/arc and slight upward look-target change, preserving the product-photography perspective.
- **Grounding:** the saucer/plinth remains the stable mass while the cup lift is small enough to avoid a floating-object effect.
- **Lighting:** the key shifts subtly in the same upper-left/front-left family; shadow softness is retained.
- **Editorial hierarchy:** as the Hero scrolls away, the model becomes more visually prominent for a moment but does not cover the CTA or proof bar.
- **Reduced motion:** progress remains at the approved static frame and Blender clips are held at time zero.

### Hero verdict

**APPROVED. Slice 01 can remain locked while development moves to the Menu exploded-breakfast slice.**

---

## Menu exploded breakfast — review target

### Purpose

Create V3's second major spatial moment: one evidence-compatible, stylised breakfast composition that begins assembled and can later separate in a shallow spiral while the real menu text remains semantic HTML.

### Static gate before motion

- Plate silhouette must read immediately as breakfast/tableware, not abstract primitives.
- Egg/toast/avocado/tomato/greens should be recognisable as an editorial food sculpture without claiming exact current plating.
- A real Manic food photograph must remain visible in the section as the truth/reference layer.
- The plate must be physically grounded under the same morning-light direction established by Hero.
- HTML menu rows stay clear, stable, and keyboard accessible.
- Mobile uses a tighter crop and reduced visual density.

### Current verdict

**Building next — static Blender model first, no scroll explosion until static review passes.**
