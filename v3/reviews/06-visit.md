# Slice 06 — Visit location token — APPROVED

## Purpose

Turn the location/contact section into a tactile physical moment without inventing a geographical 3D map. Address, hours, phone and directions remain semantic HTML.

## Blender composition

- warm cream physical card/slab
- shallow abstract street-like relief lines (decorative, explicitly not cartographic claims)
- aged brass location pin with a grounded contact cue
- tiny simplified façade marker
- restrained three-sheet paper stack
- small brass disc as a secondary scale/detail cue

## Static artifacts reviewed

- `visit-static-desktop-1600x1000.png`
- `visit-static-mobile-390x844.png`
- `visit-static-mobile-stage-390x844.png`
- generated `manic-visit.glb`

## Desktop static review — PASS

- The physical card reads immediately as a tactile location token rather than a fake interactive map.
- Brass pin is the clear 3D focal point; abstract relief lines stay secondary.
- Tiny façade marker and real exterior photo connect the abstract object back to Manic Espresso without implying architectural/cartographic accuracy.
- Warm card, cream inset, brass, charcoal and rose paper stack separate cleanly under the established upper-left morning key.
- The semantic address, phone, hours and Get directions CTA remain more important than the 3D object.
- Shadows keep the card and pin physically grounded.

## Mobile static review — PASS

The first 390×844 section-start frame intentionally prioritises address/hours/CTA, so a second deterministic mobile-stage frame was added and reviewed.

- `visit-static-mobile-stage-390x844.png` confirms the card/pin composition remains readable at phone width.
- Real exterior photo remains visible in the stage.
- The model is simplified by framing rather than by shrinking into an unreadable desktop scene.
- No horizontal overflow.

## Motion review — PASS

**Reviewed:** `visit-motion-mid-1600x1000.png` from successful V3 slice QA run `33859435610`.

Blender-authored clips:

- `ACT_VISIT_PIN_RISE`
- `ACT_VISIT_PAPER_SPREAD_2`
- `ACT_VISIT_PAPER_SPREAD_3`

The pin rises only slightly while its separate contact cue remains on the physical card. The top paper sheets separate by a few millimetres, and a small grazing-light shift makes the abstract relief lines more legible without turning the section into a camera move. The real exterior image and semantic address remain visible and stable through the motion state.

## Reduced motion / fallback / performance — PASS

- Reduced motion holds the approved static card with all Visit clips at frame zero.
- If `manic-visit.glb` fails, real exterior photography plus address/hours/phone/directions remain complete.
- One key light casts shadows.
- Camera movement is almost imperceptible; most of the spatial change comes from the Blender pin/paper clips and light.
- RAF work only continues while the visible scroll state converges.

## Verdict

**LOCKED. Proceed to Slice 07 — Gallery photo table.**
