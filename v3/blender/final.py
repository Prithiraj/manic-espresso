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
    return os.path.join(SCRIPT_DIR, '..', 'public', 'models', 'manic-final.glb')


def build():
    clear_scene()

    ceramic = principled_material('MAT_FINAL_CERAMIC', (0.90, 0.84, 0.74), roughness=0.38, coat=0.14, coat_roughness=0.56)
    ceramic_edge = principled_material('MAT_FINAL_CERAMIC_EDGE', (0.985, 0.955, 0.89), roughness=0.30, coat=0.18, coat_roughness=0.46)
    coffee = principled_material('MAT_FINAL_COFFEE', (0.085, 0.032, 0.015), roughness=0.21, coat=0.20, coat_roughness=0.24)
    crema = principled_material('MAT_FINAL_CREMA', (0.37, 0.17, 0.065), roughness=0.36)
    brass = principled_material('MAT_FINAL_BRASS', (0.46, 0.25, 0.09), roughness=0.37, metallic=0.76)
    paper = principled_material('MAT_FINAL_PAPER', (0.91, 0.87, 0.80), roughness=0.93)
    crumb_mat = principled_material('MAT_FINAL_CRUMB', (0.48, 0.29, 0.13), roughness=0.78)
    stem_mat = principled_material('MAT_FINAL_STEM', (0.16, 0.23, 0.15), roughness=0.72)
    rose = principled_material('MAT_FINAL_ROSE', (0.49, 0.17, 0.20), roughness=0.58)
    slab_mat = principled_material('MAT_FINAL_SLAB', (0.69, 0.63, 0.55), roughness=0.90)

    slab = bevel_cube('FINAL_SLAB', (4.85, 3.25, 0.22), (0.0, 0.0, -0.18), slab_mat, bevel=0.14, segments=6)

    cup_rig = empty('RIG_FINAL_CUP', (-0.78, 0.12, 0.10))
    cup_profile = [
        (0.42, 0.00), (0.47, 0.04), (0.55, 0.18), (0.61, 0.47), (0.63, 0.77),
        (0.61, 0.91), (0.58, 0.98), (0.52, 0.99), (0.515, 0.92), (0.53, 0.74),
        (0.52, 0.44), (0.47, 0.18), (0.39, 0.08), (0.36, 0.04), (0.42, 0.00),
    ]
    cup = lathe('FINAL_CUP', cup_profile, ceramic, steps=112)
    ensure_parent(cup, cup_rig)

    rim_profile = [(0.545, 0.0), (0.59, 0.012), (0.60, 0.034), (0.59, 0.057), (0.545, 0.068)]
    rim = lathe('FINAL_RIM', rim_profile, ceramic_edge, steps=112)
    rim.location.z = 0.94
    ensure_parent(rim, cup_rig)

    # Coffee deliberately sits well below the rim to signal the end-of-breakfast state.
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=0.50, depth=0.022, location=(0, 0, 0.71))
    coffee_surface = bpy.context.active_object
    coffee_surface.name = 'FINAL_COFFEE'
    add_material(coffee_surface, coffee)
    smooth(coffee_surface)
    ensure_parent(coffee_surface, cup_rig)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.36, minor_radius=0.015, major_segments=80, minor_segments=10, location=(0, 0, 0.724))
    crema_ring = bpy.context.active_object
    crema_ring.name = 'FINAL_CREMA'
    add_material(crema_ring, crema)
    ensure_parent(crema_ring, cup_rig)

    handle = tube_curve(
        'FINAL_HANDLE',
        [(0.53, 0.0, 0.72), (0.84, 0.01, 0.77), (1.03, 0.01, 0.60), (1.04, 0.01, 0.38), (0.91, 0.01, 0.22), (0.64, 0.0, 0.25)],
        0.09,
        ceramic,
        resolution=8,
        bevel_resolution=5,
    )
    ensure_parent(handle, cup_rig)

    saucer_profile = [
        (0.00, 0.00), (0.26, 0.00), (0.56, 0.025), (0.91, 0.08), (1.13, 0.15),
        (1.24, 0.22), (1.23, 0.27), (1.07, 0.30), (0.77, 0.26), (0.43, 0.20),
        (0.17, 0.17), (0.00, 0.17), (0.00, 0.00),
    ]
    saucer = lathe('FINAL_SAUCER', saucer_profile, ceramic, steps=112)
    saucer.location = (-0.78, 0.12, -0.03)

    plate_profile = [
        (0.0, 0.0), (0.25, 0.0), (0.55, 0.025), (0.82, 0.075), (0.93, 0.13),
        (0.86, 0.18), (0.60, 0.17), (0.28, 0.13), (0.0, 0.13), (0.0, 0.0),
    ]
    plate = lathe('FINAL_SIDE_PLATE', plate_profile, ceramic, steps=96)
    plate.location = (1.05, 0.42, -0.045)
    plate.scale = (0.86, 0.86, 0.86)

    # Three crumbs make the narrative state readable without inventing a menu item.
    for index, (x, y, z, sx, sy) in enumerate([
        (0.84, 0.34, 0.095, 0.09, 0.06),
        (1.18, 0.48, 0.10, 0.07, 0.05),
        (1.34, 0.28, 0.10, 0.055, 0.04),
    ]):
        crumb = flattened_sphere(f'FINAL_CRUMB_{index+1}', (x, y, z), (sx, sy, 0.025), crumb_mat, segments=24, rings=12)
        crumb.rotation_euler[2] = 0.25 * index

    spoon_rig = empty('RIG_FINAL_SPOON', (-0.10, -0.28, 0.03))
    spoon = tube_curve(
        'FINAL_SPOON_HANDLE',
        [(-0.25, 0.0, 0.06), (0.15, -0.13, 0.07), (0.58, -0.28, 0.075), (1.03, -0.46, 0.08)],
        0.035,
        brass,
        resolution=6,
        bevel_resolution=4,
    )
    ensure_parent(spoon, spoon_rig)
    spoon_bowl = flattened_sphere('FINAL_SPOON_BOWL', (1.26, -0.55, 0.09), (0.30, 0.19, 0.055), brass, segments=40, rings=20)
    spoon_bowl.rotation_euler[2] = 0.34
    ensure_parent(spoon_bowl, spoon_rig)

    receipt_rig = empty('RIG_FINAL_RECEIPT', (0.86, -0.75, 0.06))
    receipt = make_napkin('FINAL_RECEIPT', (0.0, 0.0, 0.0), (0.72, 0.39, 1.0), paper)
    receipt.rotation_euler[2] = -0.12
    ensure_parent(receipt, receipt_rig)

    # Restrained one-stem callback to the Hero.
    stem = tube_curve('FINAL_STEM', [(1.62, 0.86, 0.10), (1.54, 0.78, 0.38), (1.40, 0.73, 0.64)], 0.016, stem_mat, resolution=5, bevel_resolution=3)
    center = flattened_sphere('FINAL_FLOWER_CENTER', (1.39, 0.72, 0.68), (0.065, 0.065, 0.05), brass, segments=20, rings=10)
    for index, angle in enumerate([0, 90, 180, 270]):
        radians = math.radians(angle)
        petal = flattened_sphere(
            f'FINAL_PETAL_{index+1}',
            (1.39 + math.cos(radians) * 0.095, 0.72 + math.sin(radians) * 0.095, 0.70),
            (0.085, 0.05, 0.028),
            rose,
            segments=20,
            rings=10,
        )
        petal.rotation_euler[2] = radians

    # Author subtle motion clips now; the static Three.js pass initially holds them at frame 1.
    cup_rig.location.z = 0.02
    cup_rig.rotation_euler[2] = 0.055
    cup_rig.keyframe_insert(data_path='location', frame=1)
    cup_rig.keyframe_insert(data_path='rotation_euler', frame=1)
    cup_rig.location.z = 0.0
    cup_rig.rotation_euler[2] = 0.015
    cup_rig.keyframe_insert(data_path='location', frame=100)
    cup_rig.keyframe_insert(data_path='rotation_euler', frame=100)
    if cup_rig.animation_data and cup_rig.animation_data.action:
        cup_rig.animation_data.action.name = 'ACT_FINAL_CUP_SETTLE'

    receipt_rig.location = (0.13, -0.06, 0.02)
    receipt_rig.rotation_euler[2] = -0.08
    receipt_rig.keyframe_insert(data_path='location', frame=1)
    receipt_rig.keyframe_insert(data_path='rotation_euler', frame=1)
    receipt_rig.location = (0.0, 0.0, 0.0)
    receipt_rig.rotation_euler[2] = 0.0
    receipt_rig.keyframe_insert(data_path='location', frame=100)
    receipt_rig.keyframe_insert(data_path='rotation_euler', frame=100)
    if receipt_rig.animation_data and receipt_rig.animation_data.action:
        receipt_rig.animation_data.action.name = 'ACT_FINAL_RECEIPT_SETTLE'

    spoon_rig.rotation_euler[2] = 0.07
    spoon_rig.keyframe_insert(data_path='rotation_euler', frame=1)
    spoon_rig.rotation_euler[2] = 0.0
    spoon_rig.keyframe_insert(data_path='rotation_euler', frame=100)
    if spoon_rig.animation_data and spoon_rig.animation_data.action:
        spoon_rig.animation_data.action.name = 'ACT_FINAL_SPOON_SETTLE'

    slab['role'] = 'final-grounding-slab'
    cup_rig['role'] = 'final-cup'
    receipt_rig['role'] = 'final-receipt'

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 100
    bpy.context.scene.frame_set(1)
    export_glb(parse_output())


if __name__ == '__main__':
    build()
