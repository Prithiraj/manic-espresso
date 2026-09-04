# V3 Slice Review Log

V3 is reviewed one Blender/Three.js slice at a time. A passing build is not enough: each slice must pass static composition, desktop/mobile framing, motion, fallback, and performance checks before the next high-priority slice is approved.

## Status

| Slice | Static | Desktop | Mobile | Motion | Performance | Status |
|---|---|---|---|---|---|---|
| Hero ceramic | Pass | Pass | Pass | Pass | Pass | **Approved** |
| Menu exploded breakfast | Pass | Pass | Pass | Pass | Pass | **Approved** |
| Café miniature cutaway | In progress | Pending | Pending | Pending | Pending | **Building** |
| Why Manic still lifes | Not started | — | — | — | — | Planned |
| Final ceramic callback | Not started | — | — | — | — | Planned |
| Visit location token | Not started | — | — | — | — | Planned |
| Gallery photo table | Not started | — | — | — | — | Planned |
| Review paper | Not started | — | — | — | — | Planned |
| Proof tokens | Not started | — | — | — | — | Deferred |

---

# Slice 01 — Hero ceramic

## Static gate — PASS

**Artifacts reviewed**
- `hero-desktop-1600x1000.png`
- `hero-mobile-390x844.png`
- generated `manic-hero.glb` (~629 KiB before final compression)

**Review**
- Headline and conversion actions remain the dominant mass.
- Real Manic interior, coffee, and pancake photography stays visually important.
- Custom lathed cup, hollow interior, curved handle, saucer, spoon, napkin, floral detail, and grounding plinth read as a crafted still life rather than default primitives.
- Restrained perspective reveals both coffee surface and cup side.
- One warm upper-left/front-left key gives coherent cast/contact shadows and stable grounding.
- Mobile remains text-led while revealing the Blender composition in the lower part of the first scroll.
- Explicit GLB-abort QA proves the real-photo fallback and CTAs remain functional.

## Motion gate — PASS

**Artifact reviewed**
- `hero-scroll-mid-1600x1000.png`

**Blender clips confirmed**
- `ACT_HERO_CUP_LIFT`
- `ACT_HERO_SPOON_SHIFT`

**Review**
- Three.js scrubs Blender-authored object animation; it does not rotate the full world as a shortcut.
- Camera uses a shallow dolly/arc and very small look-target change.
- Saucer/plinth remain the stable grounded mass while the cup lift stays intentionally small.
- Key light moves within the same morning-light direction and shadow softness remains coherent.
- Reduced motion locks the exact approved static frame at Blender clip time zero.

**Verdict: APPROVED / LOCKED.**

---

# Slice 02 — Menu exploded breakfast

## Static gate — PASS

**Artifacts reviewed**
- `menu-static-desktop-1600x1000.png`
- `menu-static-mobile-390x844.png`
- generated `manic-menu.glb` (~721 KiB before animation; ~754 KiB with animation)

**Blender composition**
- custom ceramic plate/rim
- layered toast/crust
- irregular egg-white lobes + yolk
- avocado fan
- tomato discs
- feta forms
- greens/stem
- fork + knife
- charcoal presentation slab

**Review**
- Breakfast is recognisable immediately without pretending to reproduce exact current plating.
- Real Manic breakfast-roll photography remains a visible truth/reference card.
- Elevated three-quarter camera preserves plate depth instead of becoming a flat lay.
- Cream ceramic, warm toast/yolk, avocado green, tomato red, feta, and brass cutlery separate strongly against the charcoal section.
- Plate and slab are convincingly grounded by the same upper-left/front-left lighting language as Hero.
- HTML dish names/descriptions remain stable and easier to read than the 3D layer.
- Mobile uses a model-first reveal above the menu rows instead of shrinking the desktop split layout.
- Fallback QA aborts both Hero and Menu GLBs; real photos and semantic menu content remain complete.

## Motion gate — PASS

**Artifact reviewed**
- `menu-exploded-mid-1600x1000.png`

**Blender clips confirmed by automated QA**
- `ACT_MENU_EXPLODE_TOAST`
- `ACT_MENU_EXPLODE_EGG`
- `ACT_MENU_EXPLODE_AVOCADO`
- `ACT_MENU_EXPLODE_TOMATO`
- `ACT_MENU_EXPLODE_FETA`
- `ACT_MENU_EXPLODE_GREENS`
- `ACT_MENU_EXPLODE_FORK`
- `ACT_MENU_EXPLODE_KNIFE`

**Review**
- Plate and charcoal slab remain fixed while food groups separate in different X/Y/Z directions.
- Separation reads as a shallow editorial exploded view, not objects flying away.
- Toast/egg remain related as the central vertical stack; avocado, tomato, feta, and greens create the spiral around them.
- Cutlery moves only slightly and continues to provide useful scale cues.
- Camera rises/dollies minimally toward an inspection view while Blender clips provide the actual object choreography.
- Sticky-stage fix keeps the Blender plate visible through the useful part of the menu scroll instead of allowing the visual to leave too early.
- Reduced motion continues to show the approved assembled plate.

**Performance note**
- Both Hero and Menu are still eager-loaded in the current development build. Lazy-loading remains a V3 release requirement, but does not block the visual slice gate.

**Verdict: APPROVED / LOCKED.**

---

# Slice 03 — Café miniature cutaway

## Purpose

Create the most Manic-specific 3D section: a stylised miniature/dollhouse interpretation of the café that is always paired with real exterior/interior photography. It must read as an editorial spatial interpretation, not an architectural survey.

## Static Blender object target

- grounded floor/plinth slab
- back chalkboard-style wall
- open façade/window/door framing
- compact counter mass
- two small café tables
- simplified chairs
- menu/chalk panel detail
- flower/decor accent
- one or two cup-scale props for human scale

## Static gate requirements

1. Exterior/façade silhouette must read as a small café environment, not disconnected boxes.
2. Camera must show exterior framing and enough interior depth at the same time.
3. One real exterior image and one real interior image stay visible in the section.
4. Grounding/AO/shadows must make the miniature feel like a physical model on a plinth.
5. Charcoal wall, warm timber, cream trim, and floral accents should connect directly to the existing Manic visual language.
6. Mobile gets fewer furnishings and a more frontal camera rather than a shrunk desktop dollhouse.
7. No cutaway/open-wall motion until the static environment passes review.

## Planned motion gate after static approval

- Blender-authored façade group moves/slides open.
- Camera moves only far enough to reveal counter/chalkboard depth.
- The end of the sequence visually yields to the real interior photograph.
- Reduced motion stays on the approved exterior/cutaway static frame.

**Current verdict: BUILDING STATIC MODEL.**
