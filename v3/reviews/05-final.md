# Slice 05 — Final ceramic callback — APPROVED

## Purpose

Close the page with the same tactile ceramic language introduced in the Hero, but in an unmistakably post-breakfast state. The final 3D composition guides the eye toward the real conversion actions rather than behaving like another independent product render.

## Blender composition

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

## Mobile static review — PASS

- The mobile layout correctly puts semantic CTA copy/actions before the 3D stage rather than shrinking the desktop side-by-side composition.
- Cup/saucer and the real coffee photo remain legible at 390px without horizontal overflow.
- The initial automated screenshot anchored too far into the section and clipped the opening lines of the headline; this was a screenshot-framing issue rather than a layout defect. QA now anchors to the section start beneath the fixed header.

## Motion review — PASS

**Reviewed:** `final-motion-mid-1600x1000.png` from successful V3 slice QA run `33857191164`.

Blender-authored clips:

- `ACT_FINAL_CUP_SETTLE`
- `ACT_FINAL_RECEIPT_SETTLE`
- `ACT_FINAL_SPOON_SETTLE`

The mid-motion frame preserves the approved composition: cup, saucer, crumbs, receipt and spoon stay physically grounded while a small camera pull-back makes the CTA feel like the destination. The real Manic coffee image remains visible and the dark negative space feels intentional rather than crowded. The motion is readable but not theatrical.

A QA-only failure occurred in an earlier run because the deliberately early before-state exposed 56px of canvas while the screenshot test required more than 60px. The visibility threshold was corrected to reflect the intended entering state; the final run passed the complete build/static/mobile/motion/fallback gate.

## Reduced motion / fallback / performance — PASS

- Reduced motion holds all `ACT_FINAL_*` clips at the approved static state.
- Semantic CTA and real coffee photograph remain complete if `manic-final.glb` fails.
- One key light casts shadows; secondary illumination does not cast shadows.
- RAF work only continues while the visible scroll state is converging.

## Verdict

**LOCKED. Proceed to Slice 06 — Visit location token.**
