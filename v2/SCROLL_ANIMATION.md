# V2 scroll-driven 3D motion

## Goal
Add a more legible scroll-driven Three.js motion pass to the published V2 hero while preserving the approved static composition.

## Motion design
- Keep the rest frame unchanged at scroll progress `0`.
- Smooth raw scroll progress before applying transforms so touchpad/mobile scrolling does not jitter.
- Use a restrained camera arc/dolly rather than rotating the whole world aggressively.
- Let the ceramic cup/saucer set lift slightly and turn into the light as the hero scrolls away.
- Shift the plinth subtly in depth and soften the contact-shadow layer as the ceramic set lifts.
- Move the key light only a small amount so cast shadows evolve coherently with the object motion.
- Preserve pointer motion as a secondary layer, with scroll motion taking visual priority.

## Reduced motion
Under `prefers-reduced-motion: reduce`, no scroll-driven transforms are applied; the approved static render remains visible.

## Release check
- Production build must pass.
- Existing V2 visual-QA workflow must pass.
- No changes to V1.
- Publish only after the feature PR is merged.