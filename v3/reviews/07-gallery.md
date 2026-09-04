# Slice 07 — Gallery photo table — APPROVED

## Purpose

Keep real Manic Espresso photography as the primary evidence layer while giving the gallery a tactile editorial-desk composition underneath it.

## Blender composition

- warm timber tabletop / backing slab
- thin physical photo-card supports
- aged brass spoon and restrained café-scale details
- folded/torn paper elements
- subtle floral / ring-mark details

The actual Manic photographs remain HTML `<img>` elements. They are not baked into the GLB, so the photography stays accessible, replaceable and clearly separate from the 3D interpretation.

## Static artifacts reviewed

- `gallery-static-desktop-1600x1000.png`
- `gallery-static-desktop-stage-1600x1000.png`
- `gallery-static-mobile-390x844.png`
- `gallery-static-mobile-stage-390x844.png`
- generated `manic-gallery.glb`

## Desktop static review — PASS

- The three real photographs remain the obvious focal layer; the Blender tabletop and card geometry read as physical support rather than competing content.
- The wide interior photo, coffee portrait and breakfast image create a deliberate triangular composition with clear overlap and depth.
- Warm timber/paper/brass materials remain consistent with the established V3 morning-light language.
- The table edge and physical cards supply believable grounding and scale without turning the section into a generic 3D gallery.
- HTML heading and explanatory copy remain readable and visually distinct above the stage.

## Mobile static review — PASS

- Mobile retains all three real photographs and simplifies the spatial read rather than shrinking the desktop composition indiscriminately.
- The stage remains readable at 390px and introduces no horizontal overflow.
- The photographs remain usable even if the 3D model is unavailable.

## Motion review — PASS

**Reviewed:** `gallery-motion-mid-1600x1000.png` from successful full V3 QA run `33870120774`.

- Scroll motion gently biases the camera toward a more top-down editorial-table view.
- HTML photo cards shift/rotate only by a few degrees/pixels, preserving the composition and keeping the real imagery dominant.
- The wide interior photo remains the anchor while the coffee and breakfast cards create depth through overlap.
- No carousel, autoplay or constant floating loop is introduced.
- Reverse scrolling preserves the same physical relationship rather than snapping between states.

## Reduced motion / fallback / performance — PASS

- Reduced motion holds the approved static table composition.
- Automated fallback QA aborts `manic-gallery.glb` and confirms all three real photographs remain visible with the fallback note.
- One renderer and one primary shadow-casting light are used for this slice.
- Scroll rendering is event/requestAnimationFrame driven and settles when progress stops changing.

## Verdict

**LOCKED. Proceed to Slice 08 — Review paper.**
