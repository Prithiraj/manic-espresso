# Slice 04 — Why Manic still lifes

## Goal

Turn the three evidence-backed differentiators — **Generous plates**, **A warm welcome**, and **A quiet local find** — into three small Blender-authored physical worlds without making the section feel like three unrelated product demos.

The HTML headings and copy remain the meaning layer. The 3D objects are visual metaphors only.

## Static composition

### Scene A — Generous plates

Objects:
- cream ceramic plate
- two toast slabs with softened/custom bevels
- one irregular egg-white mesh with separate yolk
- avocado fan
- fork
- a few simplified garnish pieces

Composition: slightly top-down, plate cropped at the lower/right edge of its card. The plate should feel abundant but not claim to reproduce Manic's exact plating.

### Scene B — A warm welcome

Objects:
- small timber table segment
- ceramic coffee cup/saucer
- simple second-chair silhouette
- tiny flower vase
- folded napkin

Composition: the empty chair is angled outward, creating the visual idea of a place being made for someone. No people are modelled.

### Scene C — Quiet local find

Objects:
- miniature cream/charcoal façade fragment
- doorway/window opening
- dark sign block with abstract line motif
- pavement slab
- one plant/floral accent

Composition: a tiny street-facing fragment, not a claimed architectural reconstruction. This visually echoes the approved café cutaway slice without duplicating it.

## Camera / perspective

Each still life uses a restrained 32–38° perspective. The section should feel like a row of editorial product still lifes, not three miniature game levels.

Desktop: all three scenes visible together.
Mobile: one scene per row with a tighter, more frontal camera.

## Lighting

Maintain V3 morning-light continuity:
- warm key from upper-left/front-left
- weak hemisphere fill
- one shadow-casting key only
- broad matte grounding plane/contact shadow

## Motion plan

Motion is added only after static approval.

### Generous plates
Blender clip `ACT_WHY_PLATE_ASSEMBLE`: egg/avocado/toast begin separated by a few centimetres in depth and settle toward the plate as the card enters.

### A warm welcome
Blender clip `ACT_WHY_CHAIR_OPEN`: chair moves outward slightly while cup shifts a small amount toward camera.

### Quiet local find
Blender clip `ACT_WHY_DOOR_REVEAL`: façade/door opening shifts subtly to expose more depth; no theatrical door swing.

Three.js scrubs the clips from section/card progress and adds only small camera/light bias. Pointer hover/focus may add a tiny emphasis after the static/motion gate passes.

## Real photography relationship

This slice does not replace the photography-led sections around it. No customer/reviewer images are baked into the GLB. The three scenes use only neutral/custom 3D materials.

## Reduced motion

Each card remains at its approved static hero frame. No assembly, chair movement, or façade movement.

## Performance target

Prefer one shared GLB (`manic-why.glb`) containing three named root groups rather than three network requests.

Target: < 1.2 MB before final compression, with a total geometry budget roughly 70k–100k triangles across all three scenes.

## Static release gate

Before motion:
- each card is recognisable within one glance;
- the plate, table/chair, and façade read as distinct silhouettes;
- all objects feel grounded;
- lighting direction matches Hero/Menu/Café;
- text remains dominant and readable;
- desktop 1600×1000 screenshot inspected;
- mobile 390×844 screenshot inspected;
- fallback keeps the original HTML section usable if model loading fails.
