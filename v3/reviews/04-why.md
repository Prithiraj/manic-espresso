# Slice 04 — Why Manic still lifes — APPROVED

## Review inputs

- Corrected motion artifact from V3 Blender slice QA run `33854005547`.
- `why-static-desktop-1600x1000.png`
- `why-static-mobile-390x844.png`
- `why-motion-mid-1600x1000.png`
- Automated fallback/overflow checks.

## Motion review

The first motion pass exposed a hierarchy defect: animated plate/welcome/storefront parts had been re-parented outside their individual `WHY_*_ROOT` groups, which allowed geometry from one card to leak into the neighbouring scissored card renders. The Blender rigging was corrected so every animation rig remains a descendant of its original still-life root.

The corrected motion frame was visually inspected at 1600×1000. The three scenes stay isolated and coherent:

- **Generous plates** settles from a lightly separated breakfast arrangement into the approved assembled still life. Plate and HTML copy remain the visual anchors.
- **A warm welcome** uses only a restrained chair opening and cup bias toward camera; there is no character-like or game-like behaviour.
- **A quiet local find** uses a small physical doorway/façade reveal and remains visually connected to the larger café-cutaway language.

The shared upper-left morning-light direction remains coherent and the HTML cards retain priority over the 3D detail. No cross-card geometry leakage remains in the corrected frame.

## Reduced motion

- Plate is held at its approved assembled end state.
- Welcome and local-find scenes remain at their approved static starting states.
- No continuous RAF loop is required after the section settles.

## Performance / fallback

- One shared renderer and one combined GLB serve all three cards.
- Scissor rendering avoids three WebGL contexts.
- HTML card content remains complete if the GLB fails.

## Verdict

**LOCKED. Slice 04 is approved.**

Proceed to Slice 05 — Final ceramic callback.
