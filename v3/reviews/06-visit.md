# Slice 06 — Visit location token

## Status

**STATIC GATE PASSED — motion pass in progress.**

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
- generated `manic-visit.glb` (~348 KiB before final compression)

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

## Fallback / performance — PASS FOR STATIC SLICE 06

- If `manic-visit.glb` fails, the real exterior photograph and all address/hours/phone/directions content remain usable.
- One key light casts shadows; fill/ambient do not.
- Static rendering is event-driven rather than a permanent idle RAF loop.

## Static verdict

**APPROVED for motion.**

## Motion requirements

- location pin rises only a small distance and retains a grounded contact relationship
- grazing key shifts enough to reveal street-line relief
- top paper sheets separate by only a few millimetres
- camera stays mostly fixed
- reduced motion holds the approved static card
