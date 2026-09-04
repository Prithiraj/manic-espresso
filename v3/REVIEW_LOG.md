# V3 Slice Review Log

This file records the visual gate for each Blender/Three.js slice. A slice is not marked approved merely because it builds.

## Review scale

Each slice is reviewed against:

- composition / hierarchy
- camera / perspective
- lighting direction
- cast and contact shadows
- material separation
- geometry fidelity
- relationship to real Manic photography
- responsive framing
- reduced-motion/static state
- performance / loading

## Slice status

| Slice | Static build | Desktop review | Mobile review | Motion review | Performance | Status |
|---|---|---|---|---|---|---|
| Hero ceramic | In progress | Pending | Pending | Pending | Pending | **Building** |
| Proof tokens | Not started | — | — | — | — | Deferred |
| Why Manic still lifes | Not started | — | — | — | — | Planned |
| Menu exploded breakfast | Not started | — | — | — | — | Planned |
| Café miniature cutaway | Not started | — | — | — | — | Planned |
| Review paper | Not started | — | — | — | — | Planned |
| Gallery photo table | Not started | — | — | — | — | Planned |
| Visit location token | Not started | — | — | — | — | Planned |
| Final ceramic callback | Not started | — | — | — | — | Planned |

---

## Hero ceramic — review notes

### Intended static frame

- HTML headline and conversion actions remain dominant on the left.
- Real Manic interior/coffee/breakfast photography remains visible on the right.
- Blender ceramic set occupies the lower-right foreground, creating a spatial diagonal toward the image collage.
- The cup should feel crafted rather than generated from obvious primitives.
- Saucer and cup contact must be believable before any lift animation is enabled.
- Camera should reveal coffee surface and cup side simultaneously without wide-angle distortion.

### Blender object list

- custom lathed cup shell with hollow interior
- separate coffee/crema surface
- custom lathed saucer
- curved spoon
- folded napkin
- restrained floral detail
- thin plinth/table slice for grounding

### Lighting target

One warm key from upper-left/front-left, weak cool-neutral fill, soft environmental contribution. Only the key casts shadows.

### First QA questions

1. Does the ceramic silhouette look intentional at 1600×1000 with motion disabled?
2. Is there a readable contact shadow between cup/saucer and saucer/plinth?
3. Is the 3D set clearly secondary to the real café story rather than replacing it?
4. Does mobile keep the cup plus one strong real image without overcrowding?
5. Does WebGL failure still leave a complete hero?

### Current verdict

**Building — not yet reviewed.**
