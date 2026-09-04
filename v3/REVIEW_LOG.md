# V3 Slice Review Log

V3 is reviewed one Blender/Three.js slice at a time. A passing build is not enough: each slice must pass static composition, desktop/mobile framing, motion, fallback, and performance checks before approval.

## Status

| Slice | Static | Desktop | Mobile | Motion | Performance | Status |
|---|---|---|---|---|---|---|
| Hero ceramic | Pass | Pass | Pass | Pass | Pass | **Approved** |
| Menu exploded breakfast | Pass | Pass | Pass | Pass | Pass | **Approved** |
| Café miniature cutaway | Pass | Pass | Pass | Pass | Pass | **Approved** |
| Why Manic still lifes | Planned | — | — | — | — | **Next slice** |
| Final ceramic callback | Not started | — | — | — | — | Planned |
| Visit location token | Not started | — | — | — | — | Planned |
| Gallery photo table | Not started | — | — | — | — | Planned |
| Review paper | Not started | — | — | — | — | Planned |
| Proof tokens | Not started | — | — | — | — | Deferred |

---

# Slice 01 — Hero ceramic — APPROVED

**Reviewed:** `hero-desktop-1600x1000.png`, `hero-mobile-390x844.png`, `hero-scroll-mid-1600x1000.png`.

- Custom Blender cup/saucer/spoon/napkin/floral still life reads as crafted geometry, not primitives.
- Real Manic interior/coffee/pancake photography remains important.
- Warm upper-left/front-left key, restrained perspective and contact shadows make the set physically grounded.
- Blender clips `ACT_HERO_CUP_LIFT` and `ACT_HERO_SPOON_SHIFT` are scrubbed by Three.js on scroll.
- Reduced motion holds clip time zero at the approved static frame.
- Hero GLB remains roughly 0.63 MB before final compression.

**Verdict: LOCKED.**

---

# Slice 02 — Menu exploded breakfast — APPROVED

**Reviewed:** `menu-static-desktop-1600x1000.png`, `menu-static-mobile-390x844.png`, `menu-exploded-mid-1600x1000.png`.

### Static composition

- Custom ceramic plate/rim, layered toast, irregular egg white/yolk, avocado fan, tomato discs, feta, greens, fork and knife are immediately recognisable as an editorial breakfast sculpture.
- The composition is explicitly not presented as Manic Espresso's exact current plating.
- Real Manic breakfast-roll photography remains visible as the truth/reference layer.
- Plate/slab remain grounded under the same morning-light direction as Hero.
- HTML menu rows stay the primary reading layer.

### Motion

Blender-authored clips confirmed:

- `ACT_MENU_EXPLODE_TOAST`
- `ACT_MENU_EXPLODE_EGG`
- `ACT_MENU_EXPLODE_AVOCADO`
- `ACT_MENU_EXPLODE_TOMATO`
- `ACT_MENU_EXPLODE_FETA`
- `ACT_MENU_EXPLODE_GREENS`
- `ACT_MENU_EXPLODE_FORK`
- `ACT_MENU_EXPLODE_KNIFE`

Plate/slab stay fixed while ingredient groups separate in a shallow X/Y/Z spiral. Camera rises/dollies slightly; cutlery remains a scale cue. The sticky-stage correction keeps the plate visible through the useful scroll window. Reduced motion stays assembled.

**Verdict: LOCKED.**

---

# Slice 03 — Café miniature cutaway — APPROVED

## Static Blender model

The miniature includes:

- cream physical-model base and warm floor insert
- dark back and side walls
- chalkboard-style focal panel with abstract chalk strokes
- timber counter and light worktop
- simplified espresso-machine silhouette
- two café tables
- four simplified chairs
- two cup/coffee scale props
- counter vase, stems and floral accents
- cream/brass façade/window/door framing
- dark sign block with abstract line detail

This is deliberately a stylised/dollhouse interpretation based on visible Manic cues, not a claimed architectural survey.

## Static artifacts reviewed

- `cafe-static-desktop-1600x1000.png`
- `cafe-static-mobile-390x844.png`
- generated `manic-cafe.glb` (~819 KiB before final compression)

## Desktop static review — PASS

- **Silhouette:** façade frame immediately makes the model read as a small café environment rather than a collection of boxes.
- **Depth:** back wall, counter, foreground tables and open roof create clear foreground/midground/background separation.
- **Perspective:** three-quarter dollhouse camera reveals exterior framing and interior simultaneously.
- **Lighting:** the established upper-left/front-left morning key creates legible table/chair/counter shadows without blacking out the charcoal walls.
- **Materials:** cream trim, charcoal wall, timber floor/counter, brass accents, ceramic cups and rose flowers are visibly distinct.
- **Real-photo relationship:** exterior/sign photography and interior photography flank the miniature and clearly distinguish real evidence from 3D interpretation.

## Mobile static review — PASS

- More frontal/tighter framing keeps the miniature readable at 390px.
- Tables, counter and façade remain distinguishable rather than collapsing into noise.
- Real exterior/interior images remain present as spatial anchors.
- The section remains complete without WebGL; the existing two real photos are the fallback and automated QA verifies them.

## Motion review — PASS

**Reviewed:** `cafe-cutaway-mid-1600x1000.png` after a dedicated framing correction.

- Blender-authored clip `ACT_CAFE_CUTAWAY_FACADE` physically slides the front façade left and slightly forward instead of dissolving it.
- The floor, back wall, counter, tables and chairs remain stable, so the interior continues to feel grounded while the façade opens.
- The Three.js camera performs only a restrained move inward; it does not orbit around the miniature or make the section feel game-like.
- Real interior photography gains visual weight during the cutaway via opacity/scale, preserving the transition back to evidence-backed imagery.
- The first motion QA revealed that the scene scrolled out of the viewport too quickly. The fix makes the copy and café stage sticky on desktop through the cutaway window, keeping the motion visible without changing mobile flow.
- Reduced motion remains the approved static dollhouse composition.

## Performance review — PASS

- Café GLB remains under ~1 MB before final compression.
- One shadow-casting key light is used.
- RAF work only continues while motion is converging and the section is visible.
- Real-photo fallback is covered by automated QA.

**Verdict: LOCKED. Proceed to Slice 04 — Why Manic still lifes.**
