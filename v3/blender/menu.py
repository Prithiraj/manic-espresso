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
    empty,
    ensure_parent,
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
    return os.path.join(SCRIPT_DIR, '..', 'public', 'models', 'manic-menu.glb')


def cylinder(name, radius, depth, location, material, vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location)
    obj = bpy.context.active_object
    obj.name = name
    add_material(obj, material)
    smooth(obj)
    return obj


def leaf(name, location, scale, rotation, material):
    obj = flattened_sphere(name, location, scale, material, segments=28, rings=14)
    obj.rotation_euler = rotation
    return obj


def animate_rig(rig, offset, rotation, action_name):
    base_location = rig.location.copy()
    base_rotation = rig.rotation_euler.copy()

    rig.keyframe_insert(data_path='location', frame=1)
    rig.keyframe_insert(data_path='rotation_euler', frame=1)

    rig.location.x = base_location.x + offset[0]
    rig.location.y = base_location.y + offset[1]
    rig.location.z = base_location.z + offset[2]
    rig.rotation_euler.x = base_rotation.x + rotation[0]
    rig.rotation_euler.y = base_rotation.y + rotation[1]
    rig.rotation_euler.z = base_rotation.z + rotation[2]
    rig.keyframe_insert(data_path='location', frame=100)
    rig.keyframe_insert(data_path='rotation_euler', frame=100)

    if rig.animation_data and rig.animation_data.action:
        rig.animation_data.action.name = action_name
        for curve in rig.animation_data.action.fcurves:
            for point in curve.keyframe_points:
                point.interpolation = 'BEZIER'

    rig['explode_x'] = offset[0]
    rig['explode_y'] = offset[1]
    rig['explode_z'] = offset[2]


def build():
    clear_scene()

    ceramic = principled_material('MAT_MENU_CERAMIC', (0.91, 0.86, 0.77), roughness=0.40, coat=0.10, coat_roughness=0.58)
    ceramic_edge = principled_material('MAT_MENU_EDGE', (0.99, 0.96, 0.90), roughness=0.32, coat=0.14, coat_roughness=0.50)
    toast_mat = principled_material('MAT_TOAST', (0.60, 0.31, 0.11), roughness=0.76)
    toast_edge_mat = principled_material('MAT_TOAST_EDGE', (0.34, 0.15, 0.055), roughness=0.82)
    egg_white = principled_material('MAT_EGG_WHITE', (0.96, 0.94, 0.86), roughness=0.42, coat=0.06)
    yolk = principled_material('MAT_YOLK', (0.92, 0.48, 0.055), roughness=0.28, coat=0.16, coat_roughness=0.34)
    avocado = principled_material('MAT_AVOCADO', (0.36, 0.49, 0.16), roughness=0.66)
    avocado_light = principled_material('MAT_AVOCADO_LIGHT', (0.55, 0.64, 0.25), roughness=0.64)
    tomato = principled_material('MAT_TOMATO', (0.64, 0.10, 0.075), roughness=0.48, coat=0.06)
    green = principled_material('MAT_GREENS', (0.12, 0.27, 0.10), roughness=0.72)
    brass = principled_material('MAT_CUTLERY', (0.47, 0.28, 0.12), roughness=0.34, metallic=0.72)
    charcoal = principled_material('MAT_MENU_PLINTH', (0.12, 0.105, 0.095), roughness=0.91)
    feta = principled_material('MAT_FETA', (0.93, 0.90, 0.81), roughness=0.78)

    plinth = bevel_cube('MENU_PLINTH', (5.20, 3.75, 0.18), (0.0, 0.0, -0.20), charcoal, bevel=0.16, segments=6)
    plinth['role'] = 'menu-ground'

    plate_profile = [
        (0.00, 0.00), (0.40, 0.00), (0.92, 0.025), (1.45, 0.08), (1.78, 0.15),
        (1.94, 0.24), (1.93, 0.30), (1.74, 0.34), (1.34, 0.30), (0.85, 0.23),
        (0.36, 0.18), (0.00, 0.18), (0.00, 0.00),
    ]
    plate = lathe('MENU_PLATE', plate_profile, ceramic, steps=128)
    plate.location.z = -0.04
    plate['role'] = 'menu-plate'

    rim_profile = [(1.72, 0.00), (1.80, 0.02), (1.83, 0.055), (1.79, 0.085), (1.71, 0.095)]
    rim = lathe('MENU_PLATE_RIM', rim_profile, ceramic_edge, steps=128)
    rim.location.z = 0.19

    toast_root = empty('RIG_TOAST', (0, 0, 0))
    toast_crust = bevel_cube('FOOD_TOAST_CRUST', (1.68, 1.17, 0.18), (-0.32, 0.13, 0.31), toast_edge_mat, bevel=0.18, segments=7)
    toast_crust.rotation_euler[2] = -0.18
    ensure_parent(toast_crust, toast_root)
    toast = bevel_cube('FOOD_TOAST', (1.52, 1.04, 0.16), (-0.32, 0.13, 0.43), toast_mat, bevel=0.16, segments=7)
    toast.rotation_euler[2] = -0.18
    ensure_parent(toast, toast_root)

    egg_root = empty('RIG_EGG', (0.18, -0.10, 0.0))
    for idx, (offset, scale) in enumerate([
        ((0.05, -0.02, 0.56), (0.70, 0.50, 0.065)),
        ((0.38, 0.05, 0.565), (0.48, 0.38, 0.060)),
        ((-0.22, -0.10, 0.56), (0.42, 0.34, 0.060)),
        ((0.08, 0.25, 0.56), (0.46, 0.32, 0.060)),
    ]):
        lobe = flattened_sphere(f'FOOD_EGG_WHITE_{idx+1}', offset, scale, egg_white, segments=38, rings=18)
        ensure_parent(lobe, egg_root)
    egg_yolk = flattened_sphere('FOOD_EGG_YOLK', (0.16, -0.04, 0.66), (0.31, 0.29, 0.18), yolk, segments=44, rings=22)
    ensure_parent(egg_yolk, egg_root)

    avocado_root = empty('RIG_AVOCADO', (0, 0, 0))
    avocado_positions = [
        (0.78, 0.62, 0.40, -0.34),
        (0.98, 0.53, 0.42, -0.20),
        (1.14, 0.39, 0.43, -0.07),
        (1.24, 0.21, 0.44, 0.08),
        (1.26, 0.01, 0.45, 0.20),
    ]
    for idx, (x, y, z, rot) in enumerate(avocado_positions):
        mat = avocado_light if idx % 2 else avocado
        slice_obj = flattened_sphere(f'FOOD_AVOCADO_{idx+1}', (x, y, z), (0.42, 0.18, 0.10), mat, segments=32, rings=16)
        slice_obj.rotation_euler[2] = rot
        ensure_parent(slice_obj, avocado_root)

    tomato_root = empty('RIG_TOMATO', (0, 0, 0))
    for idx, (x, y, rot) in enumerate([(0.92, -0.63, -0.20), (1.18, -0.52, 0.12), (0.68, -0.76, -0.05)]):
        disc = cylinder(f'FOOD_TOMATO_{idx+1}', 0.27, 0.07, (x, y, 0.34), tomato, vertices=48)
        disc.rotation_euler[2] = rot
        ensure_parent(disc, tomato_root)

    feta_root = empty('RIG_FETA', (0, 0, 0))
    for idx, pos in enumerate([(0.55, 0.93, 0.37), (0.30, 0.83, 0.38), (0.70, 0.78, 0.39)]):
        cube = bevel_cube(f'FOOD_FETA_{idx+1}', (0.22, 0.18, 0.13), pos, feta, bevel=0.035, segments=3)
        cube.rotation_euler[2] = 0.17 * (idx - 1)
        ensure_parent(cube, feta_root)

    greens_root = empty('RIG_GREENS', (0, 0, 0))
    stem = tube_curve('FOOD_GREEN_STEM', [(-1.03, -0.63, 0.34), (-1.24, -0.34, 0.39), (-1.30, 0.03, 0.42)], 0.018, green, resolution=4, bevel_resolution=3)
    ensure_parent(stem, greens_root)
    for idx, (pos, scale, rot) in enumerate([
        ((-1.04, -0.52, 0.40), (0.25, 0.10, 0.045), (0, 0.10, 0.45)),
        ((-1.18, -0.23, 0.44), (0.28, 0.11, 0.045), (0, -0.08, -0.35)),
        ((-1.25, 0.05, 0.45), (0.23, 0.095, 0.04), (0, 0.05, 0.20)),
        ((-0.91, -0.76, 0.38), (0.20, 0.085, 0.04), (0, 0.05, -0.55)),
    ]):
        lf = leaf(f'FOOD_GREEN_LEAF_{idx+1}', pos, scale, rot, green)
        ensure_parent(lf, greens_root)

    fork_root = empty('RIG_FORK', (0, 0, 0))
    fork_handle = tube_curve('CUTLERY_FORK_HANDLE', [(-2.10, -0.78, 0.03), (-1.72, -0.90, 0.05), (-1.30, -1.00, 0.06)], 0.035, brass, resolution=5, bevel_resolution=3)
    ensure_parent(fork_handle, fork_root)
    fork_neck = bevel_cube('CUTLERY_FORK_NECK', (0.46, 0.14, 0.055), (-1.10, -1.03, 0.07), brass, bevel=0.035, segments=3)
    fork_neck.rotation_euler[2] = -0.18
    ensure_parent(fork_neck, fork_root)
    for idx in range(4):
        tine = bevel_cube(f'CUTLERY_FORK_TINE_{idx+1}', (0.34, 0.035, 0.035), (-0.86, -1.11 + idx * 0.065, 0.08), brass, bevel=0.012, segments=2)
        tine.rotation_euler[2] = -0.18
        ensure_parent(tine, fork_root)

    knife_root = empty('RIG_KNIFE', (0, 0, 0))
    knife_handle = bevel_cube('CUTLERY_KNIFE_HANDLE', (1.28, 0.13, 0.07), (1.65, -1.15, 0.06), brass, bevel=0.045, segments=3)
    knife_handle.rotation_euler[2] = 0.07
    ensure_parent(knife_handle, knife_root)
    knife_blade = bevel_cube('CUTLERY_KNIFE_BLADE', (0.98, 0.20, 0.045), (0.54, -1.08, 0.065), brass, bevel=0.035, segments=3)
    knife_blade.rotation_euler[2] = 0.07
    ensure_parent(knife_blade, knife_root)

    # Blender-authored shallow explosion. Plate and slab remain fixed; ingredient groups peel away in a spiral.
    animate_rig(toast_root, (-0.30, 0.16, 0.46), (0.03, -0.06, -0.10), 'ACT_MENU_EXPLODE_TOAST')
    animate_rig(egg_root, (0.10, -0.12, 0.78), (0.08, 0.04, 0.10), 'ACT_MENU_EXPLODE_EGG')
    animate_rig(avocado_root, (0.58, 0.36, 0.36), (-0.04, 0.10, 0.18), 'ACT_MENU_EXPLODE_AVOCADO')
    animate_rig(tomato_root, (0.66, -0.32, 0.24), (0.06, -0.03, -0.15), 'ACT_MENU_EXPLODE_TOMATO')
    animate_rig(feta_root, (-0.08, 0.66, 0.44), (-0.05, 0.03, 0.12), 'ACT_MENU_EXPLODE_FETA')
    animate_rig(greens_root, (-0.74, 0.02, 0.31), (0.05, -0.09, -0.18), 'ACT_MENU_EXPLODE_GREENS')
    animate_rig(fork_root, (-0.34, -0.34, 0.15), (0.02, 0.02, -0.06), 'ACT_MENU_EXPLODE_FORK')
    animate_rig(knife_root, (0.36, -0.40, 0.14), (-0.02, -0.01, 0.06), 'ACT_MENU_EXPLODE_KNIFE')

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 100
    bpy.context.scene.frame_set(1)
    export_glb(parse_output())


if __name__ == '__main__':
    build()
