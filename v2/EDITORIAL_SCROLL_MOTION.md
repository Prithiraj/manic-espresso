# V2 editorial scroll-motion pass

## Goal

Extend the existing Three.js hero motion into the rest of the V2 page without turning the site into a motion demo. The static layout, content hierarchy, photography and conversion actions remain primary.

## Motion language

- Keep the Three.js hero scroll animation as the strongest spatial effect.
- Add restrained scroll-linked motion to editorial sections below the fold.
- Stagger statement cards and menu rows as they enter the viewport.
- Add shallow vertical parallax to real café photography rather than rotating or distorting it.
- Give the review band and final CTA a small scale/translation response so long-page scrolling feels continuous.
- Use requestAnimationFrame and CSS custom properties; no animation dependency.
- Keep pointer effects independent from page-scroll effects.

## Reduced motion

When `prefers-reduced-motion: reduce` is active, all new scroll-linked transforms are disabled and content renders in its normal static position. Existing accessibility, semantic HTML and keyboard behavior remain unchanged.

## QA

- Existing 1600×1000 and 390×844 reduced-motion screenshots must remain stable.
- Motion-enabled Playwright QA must verify that below-fold scroll variables change after scrolling.
- No horizontal overflow or layout shift should be introduced.
