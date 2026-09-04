# Manic Espresso — Three.js V2 Visual Plan

Status: planning / visual direction locked before implementation.

## Reference baseline

This version keeps the existing Manic Espresso website as the editorial reference: warm cream background, oversized serif headline, restrained black UI, asymmetrical photography, real café imagery, and the evidence-backed Como positioning. The previous version remains untouched on `main` while this V2 is developed independently.

The 3D layer must complement the real photography rather than replace it.

## 1. Visual analysis

### Composition
- Dominant mass: editorial headline and value proposition on the left.
- Secondary mass: layered real-photo collage on the right.
- 3D anchor: a sculptural ceramic espresso cup + saucer grounded in the lower-right/mid-right plane, partially overlapping the photo composition without obscuring content.
- Negative space: retained around the headline so the page still feels calm and premium.
- Foreground: ceramic cup/saucer and a small curved brass spoon.
- Midground: photo cards and a shallow warm-paper display plinth.
- Background: warm cream field with very subtle tonal gradient and vignette.
- Major diagonal: photo-card stagger and spoon direction create a gentle lower-left to upper-right flow.

### Perspective
- Restrained product-photography camera, not a game camera.
- Desktop target FOV: ~32–36 degrees.
- Camera sits slightly above the cup with a modest downward angle.
- Look-at target biased toward the cup/saucer center rather than world origin.
- Mobile uses a separate camera framing rather than scaling desktop.

### Lighting
- One warm directional key from upper-left/front-left.
- Weak cool-neutral hemisphere/fill to preserve ceramic detail.
- Soft cast shadow from cup, saucer and spoon onto a matte ground plane.
- Secondary broad contact-shadow decal beneath the hero object for grounding.
- No multi-light showroom look.

### Palette
- Espresso ink: `#242321`
- Warm paper: `#F3EEE4`
- Milk: `#FFFDF8`
- Roasted brown: `#624A3E`
- Floral rose: `#A86570`
- Antique brass: `#AD864D`
- Sage: `#687364`

### Material direction
- Cup/saucer: warm off-white ceramic, high roughness, subtle clearcoat/specular response.
- Coffee surface: deep espresso brown, low roughness but not mirror-like.
- Spoon: brushed antique-brass material.
- Plinth/ground: matte paper/plaster surface.

## 2. Scene blocking

Initial scene objects:
1. Custom lathed espresso cup body.
2. Curved handle assembled from a tube path, not a default torus.
3. Lathed saucer with shallow center depression.
4. Coffee surface disk inset below cup rim.
5. Curved spoon built from a custom Catmull-Rom tube plus flattened bowl.
6. Rounded display plinth behind the cup to create depth separation from photography.
7. Ground plane receiving shadows.
8. Soft contact-shadow sprite/plane beneath the hero object.

No decorative 3D objects are added until the static hero frame is convincing.

## 3. Perspective lock criteria

Desktop QA frame: 1600 × 1000.
- Headline remains dominant.
- Cup occupies roughly 18–24% of the visual width.
- Top surfaces of saucer/cup are visible but not exaggerated.
- Photo cards remain legible and visually separate from the WebGL object.
- No object clips the navigation or primary actions.

Mobile QA frame: 390 × 844.
- 3D object shifts lower and partially off-canvas.
- One secondary photo card is hidden.
- Cup remains recognizable but never competes with the CTA or opening details.

## 4. Lighting + shadow lock criteria

- Key light direction is visibly coherent with cast shadows.
- Cup and spoon visibly touch the ground through contact shadows.
- Shadow opacity stays warm/neutral, never pure black.
- Shadow-map size is capped sensibly; one light casts shadows.
- Bias/normalBias are tuned to avoid acne and peter-panning.
- Static screenshot communicates depth with motion disabled.

## 5. Geometry fidelity

Hero objects must not read as raw Three.js primitives.

Implementation approach:
- Cup and saucer via `LatheGeometry` profiles.
- Handle via `TubeGeometry` with a custom curve.
- Spoon via custom tube path and tapered/flattened bowl geometry.
- Plinth via rounded-box geometry helper generated from a shape/extrusion rather than a raw box.
- Small repeated dust/highlight particles only if they materially improve atmosphere; otherwise omit.

## 6. Materials + atmosphere

- Physically based `MeshStandardMaterial` / `MeshPhysicalMaterial`.
- ACES filmic tone mapping.
- Controlled exposure.
- No glossy-plastic defaults.
- Very subtle scene fog only for far-depth separation, not as the primary depth cue.
- Contact shadow uses a procedural canvas texture to avoid extra image dependencies.

## 7. HTML / editorial system

Important interface remains semantic HTML:
- header/navigation
- hero copy
- CTA buttons
- hours/address
- menu/value content
- gallery
- contact information

WebGL is visually layered behind/right of the HTML content and marked decorative to assistive technology.

Real Manic Espresso photography remains central to the composition using the locally cached demo images already present in `site/assets/images/`.

## 8. Motion plan

Only after static QA:
- pointer: max ±0.12 world-unit camera translation / small look-at adjustment.
- scroll: slight camera dolly and vertical shift through hero range only.
- cup: no constant spinning.
- spoon: no autonomous animation.
- photo cards: CSS-only subtle reveal; no game-like movement.

With `prefers-reduced-motion: reduce`:
- camera is fully static.
- scroll/pointer scene motion is disabled.
- HTML reveals render immediately.

## 9. Responsive plan

Desktop:
- full cup/saucer/plinth composition.
- three photo cards.
- DPR capped at 1.75.

Tablet:
- slightly wider FOV and reduced plinth scale.
- fewer secondary layers.

Mobile:
- separate camera position/look-at.
- cup partly off-right/bottom.
- hide plinth if it crowds the hero.
- reduce DPR cap to 1.35.
- reduce shadow map size.
- preserve headline and CTA hierarchy.

## 10. Performance plan

- Vite + Three.js only; no general UI framework.
- One shadow-casting directional light.
- No post-processing stack unless static QA proves it is necessary.
- Controlled geometry segment counts.
- `requestAnimationFrame` only while the scene is visible/interactive; static render for reduced motion.
- Lazy-initialize WebGL after critical HTML is parsed.
- Canvas has CSS fallback background and the site remains fully usable if WebGL fails.

## 11. Accessibility

- WebGL canvas is decorative (`aria-hidden="true"`).
- All business information and CTAs remain HTML.
- Full keyboard navigation and visible focus states.
- WCAG 2.2 AA contrast target.
- Reduced motion fully supported.
- No hover-only essential information.

## 12. SEO / metadata

V2 will preserve the verified business metadata used by the current site and avoid adding unsupported claims. It will include:
- title/meta description
- Open Graph tags
- `CafeOrCoffeeShop` JSON-LD
- current address, phone and opening hours
- local demo image for OG preview

## 13. Visual QA / CI

A dedicated V2 CI workflow will:
1. install dependencies;
2. build the production bundle;
3. launch the built site;
4. render deterministic reduced-motion screenshots at 1600×1000 and 390×844;
5. upload screenshots as workflow artifacts.

Release gate:
- perspective is intentional;
- static frame has depth without motion;
- shadows visibly ground objects;
- ceramic/spoon geometry does not look placeholder-like;
- desktop and mobile screenshots have been visually inspected;
- production build passes.

## 14. Git / release workflow

- Development branch: `feature/threejs-v2`.
- Keep V1 on `main` unchanged.
- Commit this plan first.
- Implement V2 under `v2/` in iterative commits.
- Open a draft PR and keep it draft through visual QA.
- Do not merge or replace the live GitHub Pages site until explicit approval.
- After approval, merge and publish V2 as a separate version path so V1 remains available.
