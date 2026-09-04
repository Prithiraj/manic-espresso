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
    return os.path.join(SCRIPT_DIR, '..', 'public', 'models', 'manic-cafe.glb')


def cylinder(name, radius, depth, location, material, vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location)
    obj = bpy.context.active_object
    obj.name = name
    add_material(obj, material)
    smooth(obj)
    return obj


def small_cup(name, location, scale, ceramic, coffee):
    profile = [
        (0.18, 0.00), (0.20, 0.03), (0.23, 0.16), (0.24, 0.30), (0.22, 0.35),
        (0.19, 0.35), (0.19, 0.30), (0.20, 0.16), (0.16, 0.04), (0.18, 0.00),
    ]
    cup = lathe(name, profile, ceramic, steps=64)
    cup.location = location
    cup.scale = (scale, scale, scale)
    surface = cylinder(f'{name}_COFFEE', 0.18 * scale, 0.012 * scale, (location[0], location[1], location[2] + 0.31 * scale), coffee, vertices=48)
    return cup, surface


def chair(name, location, rotation, timber, charcoal):
    root = empty(name, location)
    root.rotation_euler[2] = rotation

    seat = bevel_cube(f'{name}_SEAT', (0.56, 0.54, 0.10), (location[0], location[1], 0.53), timber, bevel=0.07, segments=4)
    ensure_parent(seat, root)
    back = bevel_cube(f'{name}_BACK', (0.58, 0.10, 0.68), (location[0], location[1] + 0.22, 0.90), charcoal, bevel=0.07, segments=4)
    ensure_parent(back, root)

    for idx, (dx, dy) in enumerate([(-0.21, -0.20), (0.21, -0.20), (-0.21, 0.20), (0.21, 0.20)]):
        leg = cylinder(f'{name}_LEG_{idx+1}', 0.035, 0.52, (location[0] + dx, location[1] + dy, 0.26), charcoal, vertices=16)
        ensure_parent(leg, root)
    return root


def cafe_table(name, location, timber, charcoal):
    top = cylinder(f'{name}_TOP', 0.58, 0.10, (location[0], location[1], 0.74), timber, vertices=64)
    leg = cylinder(f'{name}_LEG', 0.08, 0.68, (location[0], location[1], 0.36), charcoal, vertices=24)
    foot = cylinder(f'{name}_FOOT', 0.31, 0.055, (location[0], location[1], 0.03), charcoal, vertices=48)
    return top, leg, foot


def build():
    clear_scene()

    cream = principled_material('MAT_CAFE_CREAM', (0.88, 0.83, 0.75), roughness=0.64)
    chalk = principled_material('MAT_CAFE_CHALK', (0.095, 0.09, 0.085), roughness=0.92)
    chalk_line = principled_material('MAT_CAFE_CHALK_LINE', (0.83, 0.81, 0.76), roughness=0.82)
    timber = principled_material('MAT_CAFE_TIMBER', (0.40, 0.24, 0.15), roughness=0.74)
    timber_light = principled_material('MAT_CAFE_TIMBER_LIGHT', (0.54, 0.36, 0.23), roughness=0.70)
    brass = principled_material('MAT_CAFE_BRASS', (0.44, 0.25, 0.09), roughness=0.38, metallic=0.70)
    rose = principled_material('MAT_CAFE_ROSE', (0.50, 0.17, 0.22), roughness=0.62)
    green = principled_material('MAT_CAFE_GREEN', (0.16, 0.26, 0.14), roughness=0.72)
    ceramic = principled_material('MAT_CAFE_CERAMIC', (0.91, 0.87, 0.80), roughness=0.42, coat=0.08)
    coffee = principled_material('MAT_CAFE_COFFEE', (0.09, 0.035, 0.017), roughness=0.20, coat=0.16)
    metal = principled_material('MAT_CAFE_METAL', (0.32, 0.31, 0.29), roughness=0.35, metallic=0.58)

    # Physical-model base and warm floor insert.
    base = bevel_cube('CAFE_BASE', (6.20, 4.75, 0.22), (0.0, 0.0, -0.18), cream, bevel=0.16, segments=6)
    floor = bevel_cube('CAFE_FLOOR', (5.70, 4.10, 0.10), (0.0, 0.0, -0.02), timber_light, bevel=0.08, segments=4)
    base['role'] = 'cafe-ground'

    # Back/side walls deliberately create a dollhouse cutaway, not a complete architectural reconstruction.
    back_wall = bevel_cube('CAFE_BACK_WALL', (5.55, 0.20, 3.20), (0.0, 1.92, 1.50), chalk, bevel=0.06, segments=3)
    left_wall = bevel_cube('CAFE_LEFT_WALL', (0.20, 3.75, 2.95), (-2.68, 0.05, 1.42), chalk, bevel=0.05, segments=3)

    # Chalkboard focal panel references the photographed dark wall without baking actual copy into 3D.
    board = bevel_cube('CAFE_CHALK_PANEL', (3.05, 0.06, 1.30), (0.30, 1.79, 1.86), chalk, bevel=0.045, segments=3)
    for idx, (z, width) in enumerate([(2.22, 2.35), (1.95, 2.65), (1.70, 1.90), (1.48, 2.40)]):
        line = bevel_cube(f'CAFE_CHALK_STROKE_{idx+1}', (width, 0.035, 0.035), (0.28, 1.745, z), chalk_line, bevel=0.012, segments=2)
        line.rotation_euler[1] = 0.01 * (idx - 1)

    # Counter: warm timber volume + lighter worktop.
    counter = bevel_cube('CAFE_COUNTER', (2.55, 0.78, 0.88), (0.82, 1.18, 0.45), timber, bevel=0.09, segments=5)
    counter_top = bevel_cube('CAFE_COUNTER_TOP', (2.74, 0.92, 0.10), (0.82, 1.18, 0.94), cream, bevel=0.06, segments=4)

    # Simplified espresso-machine silhouette gives a scale cue without pretending to match exact equipment.
    machine = bevel_cube('CAFE_MACHINE', (0.95, 0.48, 0.58), (0.70, 1.17, 1.28), metal, bevel=0.09, segments=5)
    machine_top = bevel_cube('CAFE_MACHINE_TOP', (0.78, 0.42, 0.10), (0.70, 1.17, 1.62), brass, bevel=0.04, segments=3)
    for idx, x in enumerate([0.48, 0.92]):
        head = cylinder(f'CAFE_MACHINE_HEAD_{idx+1}', 0.10, 0.14, (x, 0.91, 1.23), brass, vertices=32)
        head.rotation_euler[0] = math.pi / 2

    # Two table groups and simplified chairs create foreground/midground depth.
    cafe_table('CAFE_TABLE_A', (-1.18, 0.18), timber_light, chalk)
    chair('CAFE_CHAIR_A1', (-1.77, -0.18, 0), -0.30, timber_light, chalk)
    chair('CAFE_CHAIR_A2', (-0.64, 0.46, 0), math.pi + 0.24, timber_light, chalk)

    cafe_table('CAFE_TABLE_B', (1.28, -0.38), timber_light, chalk)
    chair('CAFE_CHAIR_B1', (1.90, -0.66, 0), 0.18, timber_light, chalk)
    chair('CAFE_CHAIR_B2', (0.78, -0.10, 0), math.pi - 0.20, timber_light, chalk)

    small_cup('CAFE_CUP_A', (-1.20, 0.17, 0.79), 0.82, ceramic, coffee)
    small_cup('CAFE_CUP_B', (1.27, -0.38, 0.79), 0.72, ceramic, coffee)

    # Floral accent on the counter, echoing Manic's photographed flowers.
    vase = cylinder('CAFE_VASE', 0.12, 0.42, (-0.25, 1.15, 1.18), ceramic, vertices=32)
    stem_root = empty('CAFE_FLOWERS', (0, 0, 0))
    stems = [
        [(-0.25, 1.15, 1.38), (-0.38, 1.12, 1.70), (-0.48, 1.07, 1.94)],
        [(-0.25, 1.15, 1.38), (-0.12, 1.15, 1.73), (0.02, 1.12, 1.91)],
        [(-0.25, 1.15, 1.38), (-0.20, 1.03, 1.68), (-0.14, 0.98, 1.82)],
    ]
    for idx, points in enumerate(stems):
        stem = tube_curve(f'CAFE_FLOWER_STEM_{idx+1}', points, 0.014, green, resolution=4, bevel_resolution=2)
        ensure_parent(stem, stem_root)
        end = points[-1]
        center = flattened_sphere(f'CAFE_FLOWER_CENTER_{idx+1}', end, (0.07, 0.07, 0.05), brass, segments=20, rings=10)
        ensure_parent(center, stem_root)
        for pidx, angle in enumerate([0, 90, 180, 270]):
            r = math.radians(angle)
            petal = flattened_sphere(
                f'CAFE_FLOWER_{idx+1}_PETAL_{pidx+1}',
                (end[0] + math.cos(r) * 0.10, end[1] + math.sin(r) * 0.10, end[2] + 0.015),
                (0.10, 0.055, 0.035), rose, segments=20, rings=10
            )
            petal.rotation_euler[2] = r
            ensure_parent(petal, stem_root)

    # Front façade / window framing is one rig so the motion pass can later slide it open as a Blender-authored cutaway.
    facade = empty('RIG_CAFE_FACADE', (0, 0, 0))
    facade_parts = [
        bevel_cube('CAFE_FACADE_LEFT', (0.30, 0.28, 2.85), (-2.52, -1.78, 1.38), cream, bevel=0.05, segments=3),
        bevel_cube('CAFE_FACADE_RIGHT', (0.30, 0.28, 2.85), (2.52, -1.78, 1.38), cream, bevel=0.05, segments=3),
        bevel_cube('CAFE_FACADE_HEADER', (5.35, 0.30, 0.34), (0.0, -1.78, 2.78), cream, bevel=0.05, segments=3),
        bevel_cube('CAFE_FACADE_SILL', (5.15, 0.24, 0.18), (0.0, -1.78, 0.20), cream, bevel=0.04, segments=3),
        bevel_cube('CAFE_DOOR_POST_A', (0.16, 0.22, 2.35), (1.15, -1.74, 1.25), brass, bevel=0.035, segments=3),
        bevel_cube('CAFE_DOOR_POST_B', (0.16, 0.22, 2.35), (2.02, -1.74, 1.25), brass, bevel=0.035, segments=3),
        bevel_cube('CAFE_DOOR_HEADER', (1.02, 0.22, 0.15), (1.58, -1.74, 2.38), brass, bevel=0.035, segments=3),
    ]
    for part in facade_parts:
        ensure_parent(part, facade)

    sign = bevel_cube('CAFE_SIGN_BLOCK', (1.55, 0.08, 0.45), (-0.85, -1.62, 2.55), chalk, bevel=0.05, segments=3)
    ensure_parent(sign, facade)
    for idx, width in enumerate([1.10, 0.82]):
        line = bevel_cube(f'CAFE_SIGN_LINE_{idx+1}', (width, 0.035, 0.035), (-0.85, -1.575, 2.63 - idx * 0.15), chalk_line, bevel=0.01, segments=2)
        ensure_parent(line, facade)

    facade['role'] = 'cutaway-facade'
    facade['cutaway_axis'] = 'x'
    facade['cutaway_distance'] = -2.9

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 100
    bpy.context.scene.frame_set(1)
    export_glb(parse_output())


if __name__ == '__main__':
    build()
