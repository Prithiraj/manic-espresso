# V3 Slice Review Log

V3 is reviewed one Blender/Three.js slice at a time. A passing build is not enough: each slice must pass static composition, desktop/mobile framing, motion, fallback, and performance checks before approval.

## Status

| Slice | Static | Desktop | Mobile | Motion | Fallback / Performance | Status |
|---|---|---|---|---|---|---|
| Hero ceramic | Pass | Pass | Pass | Pass | Pass | **Approved** |
| Menu exploded breakfast | Pass | Pass | Pass | Pass | Pass | **Approved** |
| Café miniature cutaway | Pass | Pass | Pass | Pass | Pass | **Approved** |
| Why Manic still lifes | Pass | Pass | Pass | Pass | Pass | **Approved** |
| Final ceramic callback | Pass | Pass | Pass | Pass | Pass | **Approved** |
| Visit location token | Pass | Pass | Pass | Pass | Pass | **Approved** |
| Gallery photo table | Pass | Pass | Pass | Pass | Pass | **Approved** |
| Review paper | Pass | Pass | Pass | Pass | Pass | **Approved** |
| Proof tokens | — | — | — | — | — | **Deferred intentionally** |

## Latest complete QA gate

Full V3 Blender generation, production build, desktop/mobile static checks, motion checks, fallbacks, overflow checks and release screenshots passed in GitHub Actions run **33870120774**.

Release-level screenshots reviewed:

- `release-desktop-1600x1000-full.png`
- `release-mobile-390x844-full.png`

The full-page review confirms a coherent progression from real-photo/ceramic Hero → Why Manic still lifes → exploded breakfast → café cutaway → quiet review paper → real-photo gallery → location token → final ceramic callback. The 3D vocabulary remains tactile/editorial rather than game-like, and real Manic imagery remains present throughout.

## Slice notes

Detailed review records live in:

- [`reviews/04-why.md`](reviews/04-why.md)
- [`reviews/05-final.md`](reviews/05-final.md)
- [`reviews/06-visit.md`](reviews/06-visit.md)
- [`reviews/07-gallery.md`](reviews/07-gallery.md)
- [`reviews/08-review.md`](reviews/08-review.md)

Earlier Hero, Menu and Café decisions are retained in commit history and the V3 plan.

## Release decision

### Static composition — PASS

- Major 3D objects have clear silhouettes and purposeful scale.
- Warm upper-left morning-light direction remains coherent across slices.
- Contact/cast shadows ground hero objects.
- HTML headings/actions remain the information hierarchy.
- Real photography is never replaced by a synthetic 3D claim.

### Motion — PASS

- Blender clips are scroll-scrubbed rather than free-running.
- Camera motion is restrained and secondary to object/story motion.
- Reverse scrolling remains stable.
- `prefers-reduced-motion` holds deliberately authored static states.

### Responsive — PASS

- Desktop QA uses 1600×1000.
- Mobile QA uses 390×844.
- Mobile compositions are reframed, not simply shrunk.
- No horizontal overflow in automated checks.

### Fallback — PASS

Each GLB-dependent slice has automated failure coverage. Semantic HTML and real photography remain usable if WebGL/model loading fails.

### Performance — PASS FOR PREVIEW / OPTIMISATION STILL AVAILABLE

The current model set is within the accepted preview budget and rendering is visibility/scroll driven. Final production optimisation can still add stronger lazy-loading, Meshopt/Draco/KTX2 and more aggressive model disposal without changing the approved visual frames.

## Proof token decision

The optional proof-token Blender slice is **not being built**. The current rating/review/open-days proof bar works better as a quiet typographic reset between the rich Hero and the Why Manic section. Adding 3D there would reduce pacing and make the experience feel over-decorated.

## Verdict

**V3 visual slice set is RELEASE-CANDIDATE APPROVED for the demo preview.**

The remaining work is integration/publish verification and optional performance optimisation—not additional 3D spectacle.
