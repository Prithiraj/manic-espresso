import bpy
import math
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.append(SCRIPT_DIR)

from common import (
    clear_scene,
    principled_material,
    add_material,
    lathe,
    bevel_cube,
    tube_curve,
    flattened_sphere,
    make_napkin,
    ensure_parent,
    empty,
    export_glb,
    smooth,
)


def parse_output():
    args = sys.argv
    if '--' in args:
        args = args[args.index('--') + 1:]
    for index, arg in enumerate(args):
        if arg == '--output' and index + 1 < len(args):
            return args[index + 1]
    return os.path.join(SCRIPT_DIR, '..', 'public', 'models', 'manic-hero.glb')


def build():
    clear_scene()

    # Editorial material language shared with the website.
    ceramic = principled_material('MAT_CERAMIC', (0.89, 0.83, 0.73), roughness=0.36, coat=0.16, coat_roughness=0.52)
    ceramic_edge = principled_material('MAT_CERAMIC_EDGE', (0.98, 0.95, 0.88), roughness=0.30, coat=0.2, coat_roughness=0.42)
    coffee = principled_material('MAT_COFFEE', (0.095, 0.038, 0.018), roughness=0.18, coat=0.24, coat_roughness=0.20)
    crema = principled_material('MAT_CREMA', (0.42, 0.20, 0.08), roughness=0.32)
    brass = principled_material('MAT_BRASS', (0.48, 0.27, 0.10), roughness=0.34, metallic=0.78)
    paper = principled_material('MAT_PAPER', (0.90, 0.85, 0.77), roughness=0.92)
    rose = principled_material('MAT_ROSE', (0.48, 0.16, 0.20), roughness=0.58)
    stem_mat = principled_material('MAT_STEM', (0.15, 0.23, 0.14), roughness=0.72)
    plinth_mat = principled_material('MAT_PLINTH', (0.70, 0.64, 0.55), roughness=0.88)

    # Broad grounding slab: deliberately simple and almost architectural.
    plinth = bevel_cube('GEO_PLINTH', (4.55, 3.45, 0.22), (0.0, 0.0, -0.18), plinth_mat, bevel=0.14, segments=6)

    cup_rig = empty('RIG_CUP', (0.58, 0.08, 0.12))

    # Closed shell profile: outer wall travels upward, then inner wall returns down.
    cup_profile = [
        (0.44, 0.00),
        (0.49, 0.04),
        (0.57, 0.18),
        (0.63, 0.46),
        (0.65, 0.78),
        (0.63, 0.93),
        (0.60, 1.00),
        (0.54, 1.01),
        (0.535, 0.94),
        (0.55, 0.76),
        (0.54, 0.44),
        (0.49, 0.18),
        (0.41, 0.08),
        (0.38, 0.04),
        (0.44, 0.00),
    ]
    cup = lathe('GEO_CUP', cup_profile, ceramic, steps=112)
    ensure_parent(cup, cup_rig)

    rim_profile = [(0.565, 0.0), (0.61, 0.012), (0.62, 0.035), (0.61, 0.058), (0.565, 0.07)]
    rim = lathe('GEO_RIM', rim_profile, ceramic_edge, steps=112)
    rim.location.z = 0.96
    ensure_parent(rim, cup_rig)

    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=0.53, depth=0.022, location=(0, 0, 0.935))
    coffee_surface = bpy.context.active_object
    coffee_surface.name = 'GEO_COFFEE'
    add_material(coffee_surface, coffee)
    smooth(coffee_surface)
    ensure_parent(coffee_surface, cup_rig)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.42, minor_radius=0.018, major_segments=96, minor_segments=12, location=(0, 0, 0.95))
    crema_ring = bpy.context.active_object
    crema_ring.name = 'GEO_CREMA'
    add_material(crema_ring, crema)
    ensure_parent(crema_ring, cup_rig)

    handle = tube_curve(
        'GEO_HANDLE',
        [
            (0.55, 0.00, 0.75),
            (0.88, 0.02, 0.79),
            (1.08, 0.02, 0.62),
            (1.12, 0.02, 0.39),
            (0.98, 0.02, 0.20),
            (0.67, 0.00, 0.24),
        ],
        0.095,
        ceramic,
        resolution=8,
        bevel_resolution=5,
    )
    ensure_parent(handle, cup_rig)

    saucer_profile = [
        (0.00, 0.00),
        (0.28, 0.00),
        (0.58, 0.025),
        (0.95, 0.08),
        (1.18, 0.15),
        (1.30, 0.22),
        (1.29, 0.27),
        (1.12, 0.30),
        (0.80, 0.26),
        (0.46, 0.20),
        (0.18, 0.17),
        (0.00, 0.17),
        (0.00, 0.00),
    ]
    saucer = lathe('GEO_SAUCER', saucer_profile, ceramic, steps=120)
    saucer.location = (0.58, 0.08, -0.03)

    # Secondary side plate helps create a stronger diagonal and breaks the product-render symmetry.
    side_plate_profile = [
        (0.0, 0.0), (0.28, 0.0), (0.62, 0.025), (0.88, 0.08), (0.94, 0.14),
        (0.86, 0.19), (0.58, 0.17), (0.28, 0.13), (0.0, 0.13), (0.0, 0.0),
    ]
    side_plate = lathe('GEO_SIDE_PLATE', side_plate_profile, ceramic, steps=96)
    side_plate.location = (-1.18, 0.48, -0.055)
    side_plate.scale = (0.82, 0.82, 0.82)

    spoon_rig = empty('RIG_SPOON', (-0.15, -0.25, 0.02))
    spoon = tube_curve(
        'GEO_SPOON_HANDLE',
        [(-0.2, 0.0, 0.06), (-0.65, -0.1, 0.07), (-1.10, -0.22, 0.075), (-1.55, -0.37, 0.08)],
        0.035,
        brass,
        resolution=6,
        bevel_resolution=4,
    )
    ensure_parent(spoon, spoon_rig)
    bowl = flattened_sphere('GEO_SPOON_BOWL', (-1.77, -0.45, 0.09), (0.30, 0.19, 0.055), brass, segments=40, rings=20)
    bowl.rotation_euler[2] = -0.30
    ensure_parent(bowl, spoon_rig)

    napkin = make_napkin('GEO_NAPKIN', (-0.95, -0.65, 0.06), (0.70, 0.50, 1.0), paper)
    napkin.rotation_euler[2] = 0.18

    # Restrained flower detail: a curved stem and five small petals.
    stem = tube_curve('GEO_STEM', [(-1.35, 0.88, 0.12), (-1.26, 0.76, 0.42), (-1.10, 0.70, 0.74)], 0.018, stem_mat, resolution=5, bevel_resolution=3)
    flower_center = flattened_sphere('GEO_FLOWER_CENTER', (-1.08, 0.69, 0.78), (0.075, 0.075, 0.055), brass, segments=24, rings=12)
    for index, angle in enumerate([0, 72, 144, 216, 288]):
        radians = math.radians(angle)
        x = -1.08 + math.cos(radians) * 0.11
        y = 0.69 + math.sin(radians) * 0.11
        petal = flattened_sphere(f'GEO_PETAL_{index+1}', (x, y, 0.80), (0.10, 0.055, 0.032), rose, segments=24, rings=12)
        petal.rotation_euler[2] = radians

    # Author the Blender motion clip now, but Three.js may keep it at frame 1 during the static gate.
    cup_rig.location.z = 0.0
    cup_rig.rotation_euler[2] = -0.05
    cup_rig.keyframe_insert(data_path='location', frame=1)
    cup_rig.keyframe_insert(data_path='rotation_euler', frame=1)
    cup_rig.location.z = 0.09
    cup_rig.rotation_euler[2] = 0.08
    cup_rig.keyframe_insert(data_path='location', frame=100)
    cup_rig.keyframe_insert(data_path='rotation_euler', frame=100)
    if cup_rig.animation_data and cup_rig.animation_data.action:
        cup_rig.animation_data.action.name = 'ACT_HERO_CUP_LIFT'

    spoon_rig.rotation_euler[2] = 0.02
    spoon_rig.keyframe_insert(data_path='rotation_euler', frame=1)
    spoon_rig.rotation_euler[2] = -0.07
    spoon_rig.keyframe_insert(data_path='rotation_euler', frame=100)
    if spoon_rig.animation_data and spoon_rig.animation_data.action:
        spoon_rig.animation_data.action.name = 'ACT_HERO_SPOON_SHIFT'

    # Object metadata makes the exported GLB easier to inspect from Three.js.
    cup_rig['role'] = 'hero-cup'
    plinth['role'] = 'grounding-plinth'
    saucer['role'] = 'hero-saucer'

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 100
    bpy.context.scene.frame_set(1)

    export_glb(parse_output())


if __name__ == '__main__':
    build()
