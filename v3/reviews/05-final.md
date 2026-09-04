# Slice 05 — Final ceramic callback

## Status

**STATIC GATE PASSED — motion QA in progress.**

## Purpose

Close the page with the same tactile ceramic language introduced in the Hero, but in an unmistakably post-breakfast state. The final 3D composition guides the eye toward the real conversion actions rather than behaving like another independent product render.

## Static composition

The Blender scene contains:

- off-white ceramic cup and saucer related to the Hero material language
- visibly lower coffee level
- spoon resting in a different orientation
- small side plate with restrained crumbs
- folded receipt/paper element
- warm architectural table/slab
- one restrained floral callback

## Static artifacts reviewed

- `final-static-desktop-1600x1000.png`
- `final-static-mobile-390x844.png`
- generated `manic-final.glb`

## Desktop static review — PASS

- The end-state reads clearly as the same ceramic visual family as the Hero without simply repeating the Hero composition.
- Lower coffee level, crumbs and receipt make the post-breakfast narrative legible without inventing a menu item.
- Cup/saucer/slab have clear physical contact and readable cast/contact shadows.
- Ceramic, brass, coffee, paper and floral materials separate cleanly under the established warm upper-left key.
- The real Manic coffee photograph remains present as a truth layer.
- The 3D composition stays left of the CTA; headline and Get directions action remain dominant.

## Mobile static review — PASS WITH QA-FRAMING CORRECTION

- The mobile layout correctly puts semantic CTA copy/actions before the 3D stage rather than shrinking the desktop side-by-side composition.
- Cup/saucer and the real coffee photo remain legible at 390px without horizontal overflow.
- The initial automated screenshot anchored too far into the section and clipped the opening lines of the headline; this was a screenshot-framing issue rather than a layout defect. The QA test now scrolls to the section start deterministically beneath the fixed header.

## Fallback / performance — PASS FOR STATIC SLICE 05

- Semantic CTA and real coffee photograph remain complete if `manic-final.glb` fails.
- One key light casts shadows; secondary illumination does not cast shadows.
- Rendering is event-driven in the static phase.

## Static verdict

**APPROVED for motion.**

## Motion being reviewed

Blender-authored clips:

- `ACT_FINAL_CUP_SETTLE`
- `ACT_FINAL_RECEIPT_SETTLE`
- `ACT_FINAL_SPOON_SETTLE`

Three.js adds only a small camera pull-back, restrained light shift and tiny photo drift while scrubbing those clips as the final section enters. Reduced motion remains locked to the approved static frame.
