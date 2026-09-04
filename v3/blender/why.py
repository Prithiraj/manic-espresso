import bpy
import math
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.append(SCRIPT_DIR)

from common import (
    add_material,
    bevel_cube,
    clear_scene,
    empty,
    ensure_parent,
    export_glb,
    flattened_sphere,
    lathe,
    principled_material,
    smooth,
    tube_curve,
)


def parse_output():
    args = sys.argv
    if '--' in args:
        args = args[args.index('--') + 1:]
    for index, arg in enumerate(args):
        if arg == '--output' and index + 1 < len(args):
            return os.path.abspath(args[index + 1])
    raise RuntimeError('why.py requires --output <glb>')


def cylinder(name, radius, depth, location, material, vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location)
    obj = bpy.context.active_object
    obj.name = name
    smooth(obj)
    add_material(obj, material)
    return obj


def torus(name, major_radius, minor_radius, location, material, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_radius,
        minor_radius=minor_radius,
        major_segments=64,
        minor_segments=12,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.active_object
    obj.name = name
    smooth(obj)
    add_material(obj, material)
    return obj


def cup_set(prefix, origin, ceramic, coffee, brass, parent, scale=1.0):
    x, y, z = origin
    saucer_profile = [
        (0.00, -0.06), (0.35, -0.06), (0.68, -0.03), (0.86, 0.02),
        (0.90, 0.07), (0.78, 0.10), (0.48, 0.09), (0.00, 0.08)
    ]
    saucer = lathe(f'{prefix}_SAUCER', saucer_profile, ceramic, steps=72)
    saucer.location = (x, y, z)
    saucer.scale = (scale, scale, scale)
    ensure_parent(saucer, parent)

    cup_profile = [
        (0.36, 0.00), (0.43, 0.06), (0.50, 0.34), (0.54, 0.66),
        (0.52, 0.82), (0.47, 0.86), (0.43, 0.78), (0.43, 0.18), (0.35, 0.08)
    ]
    cup = lathe(f'{prefix}_CUP', cup_profile, ceramic, steps=72)
    cup.location = (x, y, z + 0.12 * scale)
    cup.scale = (scale, scale, scale)
    ensure_parent(cup, parent)

    surface = cylinder(f'{prefix}_COFFEE', 0.42 * scale, 0.025 * scale, (x, y, z + 0.84 * scale), coffee, 56)
    ensure_parent(surface, parent)

    handle_points = [
        (x + 0.45 * scale, y, z + 0.66 * scale),
        (x + 0.78 * scale, y, z + 0.68 * scale),
        (x + 0.92 * scale, y, z + 0.44 * scale),
        (x + 0.78 * scale, y, z + 0.22 * scale),
        (x + 0.46 * scale, y, z + 0.28 * scale),
    ]
    handle = tube_curve(f'{prefix}_HANDLE', handle_points, 0.07 * scale, ceramic, resolution=3, bevel_resolution=4)
    ensure_parent(handle, parent)

    spoon = bevel_cube(
        f'{prefix}_SPOON_HANDLE',
        (1.05 * scale, 0.07 * scale, 0.035 * scale),
        (x - 0.78 * scale, y - 0.05 * scale, z + 0.16 * scale),
        brass,
        bevel=0.025 * scale,
        segments=4,
    )
    spoon.rotation_euler.z = math.radians(-14)
    ensure_parent(spoon, parent)

    bowl = flattened_sphere(
        f'{prefix}_SPOON_BOWL',
        (x - 1.25 * scale, y - 0.16 * scale, z + 0.17 * scale),
        (0.22 * scale, 0.14 * scale, 0.035 * scale),
        brass,
        segments=32,
        rings=16,
    )
    bowl.rotation_euler.z = math.radians(-14)
    ensure_parent(bowl, parent)


def make_irregular_egg(parent, origin, white_mat, yolk_mat):
    x0, y0, z0 = origin
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, location=(x0, y0, z0))
    white = bpy.context.active_object
    white.name = 'WHY_PLATE_EGG_WHITE'
    white.scale = (0.82, 0.66, 0.07)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for vert in white.data.vertices:
        angle = math.atan2(vert.co.y, vert.co.x)
        radial = 1.0 + 0.07 * math.sin(angle * 5.0) + 0.035 * math.cos(angle * 8.0)
        vert.co.x *= radial
        vert.co.y *= radial
        if vert.co.z > 0:
            vert.co.z *= 0.65
    smooth(white)
    add_material(white, white_mat)
    ensure_parent(white, parent)

    yolk = flattened_sphere('WHY_PLATE_YOLK', (x0 + 0.06, y0 - 0.02, z0 + 0.12), (0.29, 0.29, 0.18), yolk_mat, 48, 24)
    ensure_parent(yolk, parent)


def build_generous(root, mats):
    cream, toast_mat, white_mat, yolk_mat, green, tomato, brass, herb = mats

    plate_profile = [(0.00, -0.08), (0.52, -0.08), (1.25, -0.04), (1.58, 0.04), (1.66, 0.11), (1.53, 0.16), (0.85, 0.14), (0.00, 0.11)]
    plate = lathe('WHY_PLATE_DISH', plate_profile, cream, steps=96)
    plate.location = (0, 0, 0.02)
    ensure_parent(plate, root)

    toast1 = bevel_cube('WHY_PLATE_TOAST_A', (1.30, 0.90, 0.18), (-0.25, 0.02, 0.26), toast_mat, bevel=0.14, segments=6)
    toast1.rotation_euler.z = math.radians(-10)
    ensure_parent(toast1, root)
    toast2 = bevel_cube('WHY_PLATE_TOAST_B', (1.18, 0.80, 0.16), (-0.02, 0.15, 0.39), toast_mat, bevel=0.13, segments=6)
    toast2.rotation_euler.z = math.radians(8)
    ensure_parent(toast2, root)

    make_irregular_egg(root, (0.08, -0.05, 0.55), white_mat, yolk_mat)

    for i in range(6):
        angle = math.radians(-34 + i * 12)
        avo = flattened_sphere(
            f'WHY_PLATE_AVO_{i:02d}',
            (0.75 + i * 0.08, 0.34 + i * 0.02, 0.46 + i * 0.01),
            (0.34, 0.14, 0.075),
            green,
            36,
            18,
        )
        avo.rotation_euler.z = angle
        ensure_parent(avo, root)

    for i, pos in enumerate(((0.95, -0.36, 0.30), (1.10, -0.20, 0.30), (0.80, -0.18, 0.31))):
        tom = cylinder(f'WHY_PLATE_TOMATO_{i:02d}', 0.16, 0.055, pos, tomato, 32)
        ensure_parent(tom, root)

    fork = bevel_cube('WHY_PLATE_FORK_HANDLE', (1.45, 0.075, 0.045), (-1.60, 0.62, 0.20), brass, bevel=0.02, segments=3)
    fork.rotation_euler.z = math.radians(18)
    ensure_parent(fork, root)
    for i in range(4):
        tine = bevel_cube('WHY_PLATE_FORK_TINE_%02d' % i, (0.34, 0.028, 0.035), (-2.18, 0.42 + i * 0.07, 0.21), brass, bevel=0.008, segments=2)
        tine.rotation_euler.z = math.radians(18)
        ensure_parent(tine, root)

    for i, pos in enumerate(((0.38, 0.82, 0.30), (0.50, 0.72, 0.31), (0.62, 0.86, 0.32))):
        leaf = flattened_sphere(f'WHY_PLATE_HERB_{i:02d}', pos, (0.12, 0.05, 0.02), herb, 24, 12)
        leaf.rotation_euler.z = math.radians(25 + i * 25)
        ensure_parent(leaf, root)


def build_welcome(root, mats):
    ceramic, coffee, timber, dark, brass, paper, rose, stem = mats

    top = bevel_cube('WHY_WELCOME_TABLE_TOP', (2.7, 2.0, 0.18), (0, 0, 0.70), timber, bevel=0.12, segments=6)
    ensure_parent(top, root)
    pedestal = cylinder('WHY_WELCOME_TABLE_PEDESTAL', 0.16, 1.22, (0, 0, 0.04), dark, 32)
    ensure_parent(pedestal, root)
    base = cylinder('WHY_WELCOME_TABLE_BASE', 0.58, 0.09, (0, 0, -0.57), dark, 40)
    ensure_parent(base, root)

    cup_set('WHY_WELCOME', (-0.34, -0.08, 0.84), ceramic, coffee, brass, root, scale=0.70)

    seat = bevel_cube('WHY_WELCOME_CHAIR_SEAT', (1.05, 0.95, 0.14), (1.72, 0.10, 0.12), timber, bevel=0.12, segments=5)
    seat.rotation_euler.z = math.radians(-11)
    ensure_parent(seat, root)
    back = bevel_cube('WHY_WELCOME_CHAIR_BACK', (1.03, 0.14, 1.25), (1.86, 0.46, 0.88), dark, bevel=0.08, segments=4)
    back.rotation_euler.z = math.radians(-11)
    ensure_parent(back, root)
    for i, dx in enumerate((-0.38, 0.38)):
        for j, dy in enumerate((-0.31, 0.31)):
            leg = bevel_cube(f'WHY_WELCOME_CHAIR_LEG_{i}_{j}', (0.08, 0.08, 0.95), (1.72 + dx, 0.10 + dy, -0.42), dark, bevel=0.025, segments=3)
            leg.rotation_euler.z = math.radians(-11)
            ensure_parent(leg, root)

    vase = cylinder('WHY_WELCOME_VASE', 0.16, 0.42, (0.70, 0.35, 1.00), ceramic, 40)
    ensure_parent(vase, root)
    for i, offset in enumerate((-0.08, 0.0, 0.09)):
        stem_obj = tube_curve(f'WHY_WELCOME_STEM_{i}', [(0.70, 0.35, 1.18), (0.70 + offset, 0.34, 1.66 + i * 0.06)], 0.018, stem, resolution=2, bevel_resolution=3)
        ensure_parent(stem_obj, root)
        flower = flattened_sphere(f'WHY_WELCOME_FLOWER_{i}', (0.70 + offset, 0.34, 1.69 + i * 0.06), (0.13, 0.09, 0.045), rose, 28, 14)
        ensure_parent(flower, root)

    napkin = bevel_cube('WHY_WELCOME_NAPKIN', (0.72, 0.52, 0.035), (-0.86, 0.44, 0.82), paper, bevel=0.045, segments=4)
    napkin.rotation_euler.z = math.radians(12)
    ensure_parent(napkin, root)


def build_find(root, mats):
    cream, charcoal, brass, timber, rose, stem = mats

    slab = bevel_cube('WHY_FIND_PAVEMENT', (4.0, 2.8, 0.20), (0, 0, -0.72), cream, bevel=0.10, segments=5)
    ensure_parent(slab, root)
    wall = bevel_cube('WHY_FIND_WALL', (3.7, 0.28, 2.75), (0, 0.65, 0.45), charcoal, bevel=0.06, segments=4)
    ensure_parent(wall, root)
    lintel = bevel_cube('WHY_FIND_LINTEL', (3.8, 0.34, 0.28), (0, 0.46, 1.86), cream, bevel=0.05, segments=4)
    ensure_parent(lintel, root)
    left = bevel_cube('WHY_FIND_FRAME_LEFT', (0.28, 0.34, 2.55), (-1.75, 0.46, 0.50), cream, bevel=0.05, segments=4)
    right = bevel_cube('WHY_FIND_FRAME_RIGHT', (0.28, 0.34, 2.55), (1.75, 0.46, 0.50), cream, bevel=0.05, segments=4)
    ensure_parent(left, root)
    ensure_parent(right, root)

    door = bevel_cube('WHY_FIND_DOOR', (1.10, 0.20, 2.05), (0.56, 0.26, 0.18), timber, bevel=0.045, segments=4)
    ensure_parent(door, root)
    window = bevel_cube('WHY_FIND_WINDOW', (1.42, 0.10, 1.25), (-0.74, 0.24, 0.50), brass, bevel=0.035, segments=4)
    ensure_parent(window, root)
    inner = bevel_cube('WHY_FIND_WINDOW_DARK', (1.23, 0.08, 1.07), (-0.74, 0.18, 0.50), charcoal, bevel=0.02, segments=3)
    ensure_parent(inner, root)

    sign = bevel_cube('WHY_FIND_SIGN', (1.90, 0.12, 0.54), (-0.15, 0.12, 1.55), charcoal, bevel=0.06, segments=5)
    ensure_parent(sign, root)
    for i, width in enumerate((1.18, 0.82, 0.58)):
        line = bevel_cube(f'WHY_FIND_SIGN_LINE_{i}', (width, 0.025, 0.035), (-0.50 + i * 0.08, 0.045, 1.62 - i * 0.14), cream, bevel=0.01, segments=2)
        ensure_parent(line, root)

    planter = bevel_cube('WHY_FIND_PLANTER', (0.70, 0.62, 0.42), (-1.35, -0.20, -0.38), timber, bevel=0.08, segments=5)
    ensure_parent(planter, root)
    for i, offset in enumerate((-0.18, -0.06, 0.08, 0.19)):
        stem_obj = tube_curve(f'WHY_FIND_STEM_{i}', [(-1.35, -0.20, -0.17), (-1.35 + offset, -0.20, 0.42 + i * 0.09)], 0.022, stem, resolution=2, bevel_resolution=3)
        ensure_parent(stem_obj, root)
        leaf = flattened_sphere(f'WHY_FIND_LEAF_{i}', (-1.35 + offset, -0.20, 0.47 + i * 0.09), (0.16, 0.06, 0.035), rose, 28, 14)
        leaf.rotation_euler.z = math.radians(22 * i)
        ensure_parent(leaf, root)


def main():
    output = parse_output()
    clear_scene()

    ceramic = principled_material('MAT_WHY_CERAMIC', (0.93, 0.88, 0.80), roughness=0.46, coat=0.14, coat_roughness=0.66)
    ceramic_light = principled_material('MAT_WHY_CERAMIC_LIGHT', (0.985, 0.965, 0.92), roughness=0.42, coat=0.10)
    coffee = principled_material('MAT_WHY_COFFEE', (0.16, 0.075, 0.038), roughness=0.22, coat=0.18, coat_roughness=0.25)
    brass = principled_material('MAT_WHY_BRASS', (0.48, 0.29, 0.11), roughness=0.36, metallic=0.72)
    toast_mat = principled_material('MAT_WHY_TOAST', (0.64, 0.39, 0.19), roughness=0.72)
    egg_white = principled_material('MAT_WHY_EGG_WHITE', (0.97, 0.95, 0.88), roughness=0.58)
    yolk = principled_material('MAT_WHY_YOLK', (0.92, 0.47, 0.07), roughness=0.36, coat=0.08)
    green = principled_material('MAT_WHY_AVO', (0.36, 0.52, 0.24), roughness=0.68)
    herb = principled_material('MAT_WHY_HERB', (0.20, 0.36, 0.14), roughness=0.72)
    tomato = principled_material('MAT_WHY_TOMATO', (0.64, 0.13, 0.09), roughness=0.48)
    timber = principled_material('MAT_WHY_TIMBER', (0.38, 0.22, 0.13), roughness=0.72)
    charcoal = principled_material('MAT_WHY_CHARCOAL', (0.085, 0.078, 0.070), roughness=0.86)
    paper = principled_material('MAT_WHY_PAPER', (0.93, 0.90, 0.83), roughness=0.88)
    rose = principled_material('MAT_WHY_ROSE', (0.58, 0.22, 0.27), roughness=0.68)
    stem = principled_material('MAT_WHY_STEM', (0.17, 0.28, 0.11), roughness=0.78)

    plate_root = empty('WHY_PLATE_ROOT')
    welcome_root = empty('WHY_WELCOME_ROOT')
    find_root = empty('WHY_FIND_ROOT')

    build_generous(plate_root, (ceramic_light, toast_mat, egg_white, yolk, green, tomato, brass, herb))
    build_welcome(welcome_root, (ceramic_light, coffee, timber, charcoal, brass, paper, rose, stem))
    build_find(find_root, (ceramic_light, charcoal, brass, timber, rose, stem))

    export_glb(output)


if __name__ == '__main__':
    main()
