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
| Menu exploded breakfast | Pass | Pass | Pass | Pending | Pass | **Static gate passed** |
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

CI installs Blender 4.0.2 plus `python3-numpy`, generates the GLB headlessly, builds the Vite production bundle, and renders deterministic reduced-motion screenshots.

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

- **Blender motion is the object motion source:** Three.js scrubs the Blender animation clips instead of rotating the complete scene.
- **Camera choreography:** shallow dolly/arc and slight upward look-target change preserve the product-photography perspective.
- **Grounding:** saucer/plinth remains the stable mass while the cup lift is small enough to avoid a floating-object effect.
- **Lighting:** the key shifts subtly in the same upper-left/front-left family.
- **Reduced motion:** progress remains at the approved static frame and Blender clips are held at time zero.

### Hero verdict

**APPROVED. Slice 01 is locked.**

---

## Menu exploded breakfast — review notes

### Purpose

Create V3's second major spatial moment: one evidence-compatible, stylised breakfast composition that begins assembled and later separates in a shallow spiral while the real menu text remains semantic HTML.

### Blender static model

The generated plate includes:

- custom lathed ceramic plate/rim
- toast with separate crust/body geometry
- irregular egg white made from overlapping lobes plus raised yolk
- avocado fan
- tomato slices
- small feta forms
- greens/stem details
- fork and knife scale cues
- charcoal presentation slab for grounding

The composition intentionally references breakfast ingredients found in the current menu language without claiming that this is Manic Espresso's exact current plating.

### Static QA artifacts reviewed

- `menu-static-desktop-1600x1000.png`
- `menu-static-mobile-390x844.png`
- generated `manic-menu.glb` (~721 KiB before compression)

### Desktop static review — PASS

- **Recognition:** toast, egg/yolk, avocado, tomato and greens are immediately legible as a breakfast sculpture rather than generic primitives.
- **Composition:** the real Manic breakfast-roll photograph sits as an editorial truth/reference card while the Blender plate remains the larger spatial mass.
- **Camera:** the elevated three-quarter view gives enough plate depth without becoming an overhead flat lay.
- **Grounding:** the cream plate rests clearly on a dark slab with coherent cast shadows; cutlery gives useful scale cues.
- **Material hierarchy:** cream ceramic, warm toast/yolk, green avocado, tomato red and brass cutlery separate strongly against the charcoal section.
- **HTML relationship:** menu rows remain the clean right-hand reading column; the 3D scene does not compete with dish descriptions.

### Mobile static review — PASS

- The Blender plate is still identifiable at 390px and is not reduced to visual noise.
- The real food photograph remains visible at a useful size.
- The canvas precedes the menu rows, creating a deliberate visual reveal instead of squeezing a desktop split layout onto mobile.
- The QA screenshot is intentionally model/rows-focused after scrolling into the section; heading readability is covered by the normal responsive HTML layout and no horizontal overflow is introduced.

### Fallback review — PASS

The QA suite aborts both Hero and Menu GLB requests. Real photo fallbacks remain visible; business navigation and menu HTML remain functional.

### Performance review — PASS FOR STATIC SLICE 02

- `manic-menu.glb` is ~721 KiB uncompressed.
- One shadow-casting key is used.
- Menu is static after load/resize in this gate.
- The Menu GLB is still loaded eagerly in this prototype; lazy loading is a required optimisation before V3 release, but it does not block the visual gate.

### Static verdict

**APPROVED for Menu motion development.**

### Motion-pass requirements

- Ingredient separation must be authored in Blender, not as arbitrary browser-only translations.
- Plate and charcoal slab remain fixed/grounded.
- Toast, egg, avocado, tomato, feta and greens move in different X/Y/Z directions to form a shallow spiral/exploded composition.
- Cutlery may separate slightly but should continue acting as scale cues.
- Camera moves minimally toward a more top-down inspection view as ingredients separate.
- Maximum separation must preserve food recognition; no ingredient should fly outside the visual field.
- Reduced motion remains on the approved assembled static frame.

### Current verdict

**Static gate passed — building Blender-authored explosion clips next.**
