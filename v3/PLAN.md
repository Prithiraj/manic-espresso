# Manic Espresso V3 — Blender + Three.js Spatial Plan

## Status

V3 is a separate experimental experience. V1 and V2 remain untouched until V3 passes the visual release gate.

## Creative thesis

**A morning at Manic, sliced into moments.**

V3 should feel like one tactile editorial world rather than a collection of unrelated 3D demos. Real Manic Espresso photography and semantic HTML remain the source of truth. Blender supplies crafted physical objects and miniature environments; Three.js supplies camera direction, scroll scrubbing, lighting changes, responsive framing, and graceful loading/fallback behavior.

### Non-negotiables

- Static frame must look convincing before motion is added.
- Real café photography remains visually important.
- Every 3D moment must represent something a customer actually experiences at Manic.
- No spinning-product-demo behavior.
- No game-like camera controls.
- No important business text baked into meshes/textures.
- `prefers-reduced-motion` gets deliberately authored static states.
- WebGL failure falls back to real photography and semantic HTML.
- V3 is built and reviewed slice by slice; each slice gets its own commit and QA notes.

---

## 1. Blender project architecture

Blender source is generated/maintained through headless Python scripts so the repository remains reviewable and repeatable.

```text
v3/
  blender/
    common.py
    hero.py
    why-manic.py
    menu.py
    cafe.py
    review.py
    gallery.py
    visit.py
    final.py
  public/
    models/             # generated in CI; not hand-authored
  src/
    scene-manager.js
    scenes/
      hero-scene.js
      why-scene.js
      menu-scene.js
      cafe-scene.js
      review-scene.js
      gallery-scene.js
      visit-scene.js
      final-scene.js
  tests/
  qa-screenshots/
```

Generated GLBs:

```text
models/manic-hero.glb
models/manic-why.glb
models/manic-menu.glb
models/manic-cafe.glb
models/manic-review.glb
models/manic-gallery.glb
models/manic-visit.glb
models/manic-final.glb
```

The initial implementation may generate only the models for completed slices. Later slices must not block earlier slice QA.

---

## 2. Shared Blender visual language

### Materials

Create a restrained reusable material library:

- **Warm ceramic** — off-white, medium roughness, tiny surface variation, restrained clearcoat.
- **Espresso** — deep warm brown, subtle reflective surface, separate crema accent.
- **Aged brass** — warm metallic tone, not mirror-polished.
- **Chalkboard charcoal** — high roughness, near-black with subtle chalk variation.
- **Warm timber** — low-frequency grain, mostly matte.
- **Paper** — off-white, physically thin, slightly curved edges.
- **Glass** — used sparingly and with realistic roughness.

### Lighting continuity

All sections use a common morning-light direction: upper-left/front-left. Section-specific exposure and softness can change, but light direction should remain coherent through the page.

### Geometry budget

Approximate targets:

```text
Hero model:             50k–90k triangles
Menu hero:              40k–70k
Cafe miniature:         70k–120k
Secondary section GLBs: 15k–40k each
```

Use geometry only where it materially improves silhouette or close-up detail. Background props should be simplified aggressively.

---

## 3. Spatial transition language

Three recurring transition types:

### A. Slice apart
A physical object separates into meaningful layers/components.

Example: breakfast plate → toast → egg → avocado → garnish.

### B. Slice through
The camera moves through a physical boundary into the next spatial idea.

Example: café exterior → façade opens → miniature interior.

### C. Flatten back to photography
A 3D object aligns with a real photograph and yields visual priority back to the real café image.

These transitions should repeat enough to create a coherent language without becoming formulaic.

---

# SECTION PLAN

## Slice 1 — Hero: “Morning begins”

### Blender objects

- custom espresso cup
- saucer
- spoon
- small side plate
- folded napkin
- one simple floral stem/detail
- small chalkboard/timber spatial accent

### Composition

Desktop keeps HTML headline/actions on the left. The 3D set sits low-right and creates a diagonal into real interior/coffee/pancake photography.

Recommended perspective:

- FOV roughly 30–34°
- camera slightly above table height
- downward angle about 12–18°
- enough cup top visible to read the coffee surface
- no exaggerated wide-angle distortion

### Scroll states

- **0–20%:** fully grounded still life.
- **20–45%:** small camera dolly and arc; cup turns only a few degrees.
- **45–70%:** cup lifts minimally while saucer stays grounded; contact shadow softens.
- **70–100%:** camera rises toward a slightly more top-down frame and prepares the transition into proof/Why Manic.

### Static gate

Before enabling scroll motion, desktop and mobile screenshots must show:

- readable ceramic/material separation
- believable cup/saucer contact
- coherent key-light direction
- real photographs still visually important

---

## Slice 2 — Proof bar: “Grounded in reality”

Keep this primarily HTML and typographic.

Optional Blender background detail: three miniature ceramic/brass tokens that sit behind the current rating/reviews/open-seven-days facts. They are decorative only; HTML remains the meaning layer.

Motion is deliberately minimal: a small settle/rotation and tightening contact shadow.

---

## Slice 3 — Why Manic: three physical still lifes

Current evidence-backed ideas remain:

1. Generous plates
2. A warm welcome
3. A quiet local find

### 3A. Generous plates

Stylised editorial breakfast sculpture:

- plate
- toast
- egg form
- avocado forms
- garnish
- fork

On scroll, ingredients separate by a few centimetres in depth, then settle into a composed plate.

### 3B. A warm welcome

- small table edge
- coffee cup
- second chair silhouette
- flower vase
- napkin

On scroll, chair moves outward slightly and the cup shifts subtly toward the viewer. No character animation.

### 3C. Quiet local find

- simplified exterior doorway/façade fragment
- café sign block
- pavement slab
- plant/floral prop

This becomes the visual teaser for the later full café miniature.

---

## Slice 4 — Menu: “Breakfast exploded”

This is the second major V3 spectacle after the Hero.

### Blender model

One stylised breakfast composition rather than fabricated models for every menu item:

- plate
- toast
- egg
- avocado
- tomato
- greens
- fork
- knife
- coffee cup

### Scroll choreography

Start assembled. As the visitor progresses through the menu, components separate in a shallow spiral across X/Y/Z rather than simply flying vertically. Camera moves slightly around the plate while HTML menu rows remain stable and readable.

### Row interaction

Desktop hover and keyboard focus may bias the composition toward a related ingredient cluster, but should never obscure the menu text.

### Blender animation

Prefer a named Blender animation clip (`ACT_MENU_EXPLODE`) that Three.js scrubs using section scroll progress.

---

## Slice 5 — Our Place: miniature café cutaway

This is the strongest “specific to Manic Espresso” 3D opportunity.

### Blender scene

Stylised miniature/dollhouse based only on visible evidence:

- floor slab
- simplified exterior wall/opening
- doorway/window geometry
- counter
- 2–3 tables
- chairs
- chalkboard-style wall area
- flower/decor accents

It is an interpretation, not a claimed architectural survey.

### Scroll sequence

- entry: exterior/three-quarter view
- 30%: façade section slides sideways/open
- 50%: camera moves through opening
- 70%: interior/chalkboard/counter become prominent
- 90%: real interior photograph overlaps/aligned match-cut
- exit: photography dominates again

### QA

Real exterior/interior photos must stay next to the miniature so the visitor understands 3D interpretation versus real café evidence.

---

## Slice 6 — Reviews: quiet paper moment

Do not add a large 3D hero here.

Blender object:

- one slightly curved paper/receipt card
- table/chair shadow cues

HTML keeps the evidence-backed sentiment headline and review link.

Motion: paper rotates from edge-on to readable frontal composition while the shadow changes softly.

---

## Slice 7 — Gallery: 3D photo table

Photography remains primary.

Blender environment:

- warm timber/table surface
- thin photo-card geometry
- spoon
- flower/detail
- subtle coffee-ring stain
- torn paper/menu corner

Where possible, actual HTML `<img>` elements visually align with the 3D photo cards rather than baking photos into GLB textures.

Camera transitions gradually from angled tabletop to more top-down editorial contact-sheet framing.

---

## Slice 8 — Visit: physical location token

Do not build a fake geographical 3D map.

Blender elements:

- cream map/card object
- embossed abstract street lines
- brass location pin
- tiny façade marker

Address, hours, phone, and directions remain semantic HTML.

Scroll: pin rises slightly from the card and grazing light reveals the embossed lines.

The hours block may visually align over a restrained stack of thin paper cards.

---

## Slice 9 — Final CTA: “Morning completed”

Return to the ceramic hero language for narrative closure.

Blender scene:

- cup/saucer/spoon callback
- lower coffee level / post-breakfast still-life state
- small crumb / folded receipt detail

Composition should point visually toward the Directions CTA rather than simply showing a centred product render.

---

# THREE.JS / BLENDER RESPONSIBILITIES

## Animate in Blender

Use Blender keyframed clips for complex object relationships:

- `ACT_HERO_CUP_LIFT`
- `ACT_WHY_PLATE_ASSEMBLE`
- `ACT_MENU_EXPLODE`
- `ACT_CAFE_CUTAWAY`
- `ACT_REVIEW_PAPER`
- `ACT_VISIT_PIN`
- `ACT_FINAL_RESET`

## Animate in Three.js

Three.js owns:

- camera movement
- light movement
- scroll timeline
- GLB loading/disposal
- Blender clip scrubbing
- pointer/focus refinements
- responsive framing
- performance throttling

---

# SCENE MANAGER ARCHITECTURE

```text
SceneManager
 ├─ HeroScene
 ├─ WhyScene
 ├─ MenuScene
 ├─ CafeScene
 ├─ ReviewScene
 ├─ GalleryScene
 ├─ VisitScene
 └─ FinalScene
```

Only the current section and the nearest adjacent heavy section should remain GPU-active where practical.

Each section exposes normalized progress:

```text
0.0 approaching
0.2 entering
0.5 hero state
0.8 transition out
1.0 exited
```

Use one requestAnimationFrame loop plus IntersectionObserver rather than independent scroll loops for every scene.

---

# RESPONSIVE PLAN

Do not shrink desktop scenes.

### Mobile Hero

Keep cup/saucer + one real image. Hide extra decorative props.

### Why Manic

Show one still-life composition at a time.

### Menu

Use a tighter plate crop and reduced ingredient separation.

### Cafe miniature

Use a more frontal cutaway and fewer secondary furnishings.

### Gallery

Disable or simplify the 3D tabletop if the real images already provide enough depth.

### Visit

Keep only pin/card and semantic information.

---

# PERFORMANCE PLAN

### Initial load

Only HTML, CSS, hero photography, and Hero GLB.

### Lazy loading

- preload Why model near proof bar
- preload Menu model near Why section
- preload Café model near Menu section
- unload/dispose heavy previous geometry where practical

### Rendering

- desktop DPR max ~1.5–1.75
- tablet ~1.4
- mobile ~1.2–1.35
- stop WebGL rendering for offscreen scenes
- one primary shadow-casting light per scene
- bake AO for complex café miniature if useful

### Textures

Default to 1K maps. Use 2K only for a hero material that visibly needs it. Prefer shared texture atlases and Meshopt/Draco/KTX2 where the pipeline benefits.

---

# ACCESSIBILITY / REDUCED MOTION

With `prefers-reduced-motion: reduce`:

- no scroll scrubbing
- no camera dolly
- no object lifting
- no façade opening animation
- no ingredient explosion
- no parallax
- each section uses a deliberately authored static frame

All business information remains in semantic HTML and is understandable without WebGL.

---

# FALLBACK STRATEGY

If WebGL or a GLB fails:

```text
real Manic photograph
+ editorial CSS layout
+ semantic HTML content
```

No blank WebGL panels and no essential information lost.

---

# SLICE-BY-SLICE DEVELOPMENT / REVIEW WORKFLOW

Every slice follows this exact sequence:

1. **Plan note** — document the intended static composition, Blender object list, camera, lighting, and scroll states.
2. **Blender generation script** — create/export the GLB headlessly.
3. **Static Three.js integration** — no motion first.
4. **Static QA screenshots** — desktop 1600×1000 and mobile 390×844 where the slice is visible.
5. **Review log** — note composition, grounding, materials, hierarchy, and problems.
6. **Fix pass** — adjust geometry/camera/lighting until static gate passes.
7. **Motion pass** — add/scrub Blender clip and camera/light scroll choreography.
8. **Motion QA** — screenshot key progress states and verify reduced motion.
9. **Performance check** — model size, bundle size, overflow, WebGL fallback.
10. **Slice approval in `v3/REVIEW_LOG.md`** — only then proceed to the next slice.

Commit naming:

```text
v3: plan hero slice
v3: build Blender hero model
v3: integrate static hero
v3: review hero static frame
v3: add hero scroll choreography
v3: approve hero slice
```

Repeat per slice.

---

# VISUAL QA MATRIX

Minimum screenshots:

```text
hero-desktop.png
hero-mobile.png
hero-scroll-mid.png

why-desktop.png
why-mobile.png

menu-start.png
menu-mid.png
menu-end.png

cafe-exterior.png
cafe-cutaway.png
cafe-photo-transition.png

review.png
gallery.png
visit-desktop.png
visit-mobile.png
final-cta.png
```

Static QA should force reduced motion. Motion QA should explicitly enable motion and set deterministic scroll positions.

---

# RELEASE GATE

V3 is not publishable until:

- every major Blender slice looks intentional as a still frame
- hero/menu/café geometry no longer reads as placeholder primitives
- lighting direction stays coherent across sections
- contact/cast shadows ground every hero object
- real photography remains visible and important
- desktop composition is inspected at 1600×1000
- mobile composition is inspected at 390×844
- reduced-motion/static fallback is complete
- GLBs are lazy-loaded and reasonably compressed
- no horizontal overflow
- production build passes
- V1 and V2 remain available for side-by-side comparison

---

# IMPLEMENTATION ORDER

Priority is visual return, not page order:

1. **Hero ceramic** — establish Blender pipeline/material language.
2. **Menu exploded breakfast** — biggest second wow moment.
3. **Café miniature cutaway** — strongest Manic-specific spatial story.
4. **Why Manic still lifes**.
5. **Final ceramic callback**.
6. **Visit location token**.
7. **Gallery table**.
8. **Review paper**.
9. **Proof decorative tokens** only if they improve rather than clutter the page.

The first serious V3 checkpoint is reached only when Hero, Menu, and Café slices all pass their static and motion review gates.