# Manic Espresso Three.js V2 — Visual QA

Status: **release candidate for review; PR remains draft pending approval.**

Latest reviewed visual-QA run: `33840393193` (`dbcc76ab8d1c7a5d487ebbeb617eebb1c0537941`).

Artifacts:
- `desktop-1600x1000.png`
- `mobile-390x844.png`

Both screenshots are rendered with `prefers-reduced-motion: reduce` so the static frame is deterministic and the scene must communicate depth without animation.

## Static release gate

| Gate | Result | Notes |
|---|---|---|
| Intentional perspective | Pass | Restrained product/editorial camera; visible cup and saucer top surfaces without a game-camera look. |
| Major object scale | Pass | Ceramic set is secondary to the real café photography and headline. |
| Grounding / shadows | Pass | Cup, saucer, spoon and plinth read as grounded through directional shadows plus a broad contact shadow. |
| Depth without motion | Pass | Photo overlap, perspective, cast shadows, foreground ceramic and background image plane separate clearly in reduced-motion screenshots. |
| Coherent light direction | Pass | Dominant warm key reads consistently from upper-left/front-left with restrained fill. |
| Hero geometry fidelity | Pass | Cup/saucer are lathed profiles, handle is custom tube geometry, spoon uses a custom curve/extruded bowl; no raw box/sphere hero. |
| Desktop visual inspection | Pass | 1600×1000 composition preserves headline dominance, negative space, image hierarchy and 3D grounding. |
| Mobile visual inspection | Pass | 390×844 independently reframes the hero; CTA remains prominent while real imagery and the ceramic scene are visible in the first viewport. |
| Reduced motion | Pass | Pointer/scroll camera motion is disabled; scene renders as a static composition. |
| Production build | Pass | Vite build and Playwright visual QA completed successfully in GitHub Actions. |

## Visual notes

### Desktop
- The interior photo is the dominant visual mass on the right.
- The coffee photo creates a foreground/high-right counterweight.
- The pancake photo anchors the lower-right corner.
- The ceramic cup/saucer/spoon overlaps these layers without replacing the real photography.
- The warm plinth and contact shadow keep the 3D object physically grounded.

### Mobile
- Typography and primary CTAs remain readable before the visual composition.
- The image/3D scene enters the first viewport rather than being pushed entirely below the fold.
- The WebGL composition is shifted upward independently of desktop framing.
- The secondary food photo is removed on mobile to preserve clarity and performance.

## Motion assessment

The normal-motion version uses only small camera translation/look-at changes from pointer and hero scroll progress. The ceramic objects themselves do not spin or float. Motion is therefore additive to an already readable static composition rather than responsible for creating depth.

## Performance controls

- one shadow-casting directional light;
- no post-processing stack;
- DPR capped per breakpoint;
- smaller shadow map on mobile;
- no UI framework;
- scene pauses when outside the viewport / document is hidden;
- static CSS/photo fallback remains usable if WebGL initialization fails.

## Release status

The visual release gate is satisfied for a **reviewable release candidate**. Per the project workflow, the PR must remain draft and V1 must remain published until explicit approval is given to merge and deploy V2 as a separate version.

Image-rights status is unchanged: the real Manic Espresso photography used in this demo is locally cached for reliability but remains demo/editorial material until licensed or replaced with owner-supplied originals.
