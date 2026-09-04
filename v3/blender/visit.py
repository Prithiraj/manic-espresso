import bpy
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.append(SCRIPT_DIR)

from common import (
    clear_scene,
    principled_material,
    add_material,
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
    return os.path.join(SCRIPT_DIR, '..', 'public', 'models', 'manic-visit.glb')


def add_disc(name, location, radius, depth, material, vertices=64):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location)
    obj = bpy.context.active_object
    obj.name = name
    add_material(obj, material)
    smooth(obj)
    return obj


def add_pin(root, brass, dark):
    # A simple physical location token, not a geographic representation.
    head = flattened_sphere('VISIT_PIN_HEAD', (0.48, 0.05, 0.68), (0.47, 0.24, 0.50), brass, segments=56, rings=28)
    ensure_parent(head, root)

    inner = flattened_sphere('VISIT_PIN_INSET', (0.48, -0.195, 0.72), (0.19, 0.035, 0.19), dark, segments=40, rings=20)
    ensure_parent(inner, root)

    bpy.ops.mesh.primitive_cone_add(vertices=56, radius1=0.06, radius2=0.30, depth=0.62, location=(0.48, 0.04, 0.20))
    tail = bpy.context.active_object
    tail.name = 'VISIT_PIN_TAIL'
    add_material(tail, brass)
    smooth(tail)
    ensure_parent(tail, root)

    foot = flattened_sphere('VISIT_PIN_CONTACT', (0.48, 0.07, -0.01), (0.25, 0.16, 0.035), dark, segments=36, rings=16)
    ensure_parent(foot, root)


def add_street_lines(card_root, line_mat):
    # Abstract route-like relief only. These curves intentionally do not trace real streets.
    lines = [
        [(-1.85, -0.82, 0.04), (-1.20, -0.42, 0.045), (-0.40, -0.30, 0.045), (0.25, -0.02, 0.045), (1.45, 0.02, 0.045)],
        [(-1.55, 0.72, 0.04), (-0.88, 0.32, 0.045), (-0.30, 0.20, 0.045), (0.18, -0.18, 0.045), (0.52, -0.88, 0.045)],
        [(-0.95, -1.12, 0.04), (-0.78, -0.54, 0.045), (-0.82, 0.15, 0.045), (-0.43, 0.76, 0.045), (0.20, 1.05, 0.045)],
        [(0.92, -0.94, 0.04), (0.72, -0.46, 0.045), (0.78, 0.08, 0.045), (1.18, 0.52, 0.045), (1.74, 0.76, 0.045)],
    ]
    for index, points in enumerate(lines):
        line = tube_curve(f'VISIT_RELIEF_LINE_{index+1}', points, 0.027, line_mat, resolution=5, bevel_resolution=3)
        ensure_parent(line, card_root)


def add_facade_marker(parent, cream, charcoal, brass):
    marker_loc = (-1.22, 0.58, 0.12)
    marker = empty('VISIT_FACADE_MARKER', marker_loc)
    ensure_parent(marker, parent)

    def world(local):
        return tuple(marker_loc[i] + local[i] for i in range(3))

    base = bevel_cube('VISIT_MARKER_BASE', (1.02, 0.32, 0.12), world((0.0, 0.0, 0.0)), cream, bevel=0.045, segments=4)
    wall = bevel_cube('VISIT_MARKER_WALL', (0.90, 0.12, 0.58), world((0.0, 0.03, 0.30)), charcoal, bevel=0.025, segments=3)
    frame_left = bevel_cube('VISIT_MARKER_FRAME_L', (0.07, 0.04, 0.42), world((-0.30, -0.045, 0.27)), brass, bevel=0.018, segments=3)
    frame_right = bevel_cube('VISIT_MARKER_FRAME_R', (0.07, 0.04, 0.42), world((0.30, -0.045, 0.27)), brass, bevel=0.018, segments=3)
    lintel = bevel_cube('VISIT_MARKER_FRAME_TOP', (0.67, 0.04, 0.07), world((0.0, -0.045, 0.45)), brass, bevel=0.018, segments=3)
    for obj in (base, wall, frame_left, frame_right, lintel):
        ensure_parent(obj, marker)


def add_paper_stack(paper, accent):
    stack_loc = (1.35, -0.72, 0.10)
    stack_root = empty('VISIT_PAPER_STACK', stack_loc)
    for index, offset in enumerate([(0, 0, 0), (-0.06, 0.07, 0.045), (0.05, 0.13, 0.09)]):
        location = tuple(stack_loc[i] + offset[i] for i in range(3))
        sheet = bevel_cube(
            f'VISIT_PAPER_{index+1}',
            (1.38, 0.86, 0.035),
            location,
            paper if index < 2 else accent,
            bevel=0.045,
            segments=4,
        )
        sheet.rotation_euler[2] = [-0.05, 0.035, -0.018][index]
        ensure_parent(sheet, stack_root)
    return stack_root


def build():
    clear_scene()

    card_mat = principled_material('MAT_VISIT_CARD', (0.88, 0.83, 0.75), roughness=0.90)
    card_edge = principled_material('MAT_VISIT_EDGE', (0.96, 0.92, 0.85), roughness=0.72)
    brass = principled_material('MAT_VISIT_BRASS', (0.50, 0.29, 0.11), roughness=0.35, metallic=0.74)
    charcoal = principled_material('MAT_VISIT_CHARCOAL', (0.07, 0.065, 0.06), roughness=0.84)
    relief = principled_material('MAT_VISIT_RELIEF', (0.61, 0.56, 0.50), roughness=0.82)
    paper = principled_material('MAT_VISIT_PAPER', (0.94, 0.90, 0.83), roughness=0.94)
    rose = principled_material('MAT_VISIT_ROSE', (0.53, 0.24, 0.27), roughness=0.62)

    root = empty('VISIT_ROOT')
    card = bevel_cube('VISIT_CARD', (4.80, 3.25, 0.18), (0.0, 0.0, -0.12), card_mat, bevel=0.18, segments=7)
    ensure_parent(card, root)
    inset = bevel_cube('VISIT_CARD_INSET', (4.36, 2.83, 0.035), (0.0, 0.0, 0.005), card_edge, bevel=0.14, segments=6)
    ensure_parent(inset, root)

    add_street_lines(root, relief)

    pin_rig = empty('RIG_VISIT_PIN')
    ensure_parent(pin_rig, root)
    add_pin(pin_rig, brass, charcoal)

    add_facade_marker(root, card_edge, charcoal, brass)
    stack = add_paper_stack(paper, rose)
    ensure_parent(stack, root)

    # Small compass-like disc as a decorative scale cue; no directional claim is made.
    disc = add_disc('VISIT_DECOR_DISC', (1.58, 0.74, 0.08), 0.20, 0.045, brass, vertices=48)
    ensure_parent(disc, root)
    dot = add_disc('VISIT_DECOR_DOT', (1.58, 0.74, 0.112), 0.075, 0.018, charcoal, vertices=36)
    ensure_parent(dot, root)

    root['role'] = 'decorative-location-card'
    pin_rig['role'] = 'location-token'
    stack['role'] = 'hours-paper-stack'

    export_glb(parse_output())


if __name__ == '__main__':
    build()
