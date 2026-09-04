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
    bevel_cube,
    tube_curve,
    flattened_sphere,
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
    return os.path.join(SCRIPT_DIR, '..', 'public', 'models', 'manic-review.glb')


def build_curved_paper(material):
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=28, y_subdivisions=22, size=2.0, location=(0.0, 0.0, 0.18))
    paper = bpy.context.active_object
    paper.name = 'GEO_REVIEW_PAPER'
    paper.scale = (1.58, 1.02, 1.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # A restrained handmade curve: edges lift slightly, center remains visually calm.
    for vert in paper.data.vertices:
        x, y, _ = vert.co
        edge = 0.035 * (x * x)
        wave = 0.018 * math.sin(y * 2.7) + 0.010 * math.cos(x * 2.2)
        vert.co.z = edge + wave

    solid = paper.modifiers.new('Paper thickness', 'SOLIDIFY')
    solid.thickness = 0.022
    solid.offset = -0.35
    bevel = paper.modifiers.new('Paper edge softness', 'BEVEL')
    bevel.width = 0.016
    bevel.segments = 3
    subd = paper.modifiers.new('Paper surface soften', 'SUBSURF')
    subd.levels = 1
    subd.render_levels = 1

    bpy.context.view_layer.objects.active = paper
    bpy.ops.object.modifier_apply(modifier=solid.name)
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    bpy.ops.object.modifier_apply(modifier=subd.name)
    smooth(paper)
    add_material(paper, material)
    return paper


def build():
    clear_scene()

    paper_mat = principled_material('MAT_REVIEW_PAPER', (0.91, 0.86, 0.78), roughness=0.90)
    paper_edge = principled_material('MAT_REVIEW_EDGE', (0.77, 0.69, 0.60), roughness=0.82)
    brass = principled_material('MAT_REVIEW_BRASS', (0.46, 0.25, 0.09), roughness=0.38, metallic=0.78)
    coffee = principled_material('MAT_REVIEW_COFFEE', (0.16, 0.065, 0.026), roughness=0.42)
    charcoal = principled_material('MAT_REVIEW_SURFACE', (0.105, 0.098, 0.088), roughness=0.96)

    # A low dark desk fragment gives the paper a physical reference without becoming another hero plinth.
    surface = bevel_cube('GEO_REVIEW_SURFACE', (4.25, 3.05, 0.12), (0.0, 0.0, -0.12), charcoal, bevel=0.12, segments=5)
    surface['role'] = 'review-grounding-surface'

    paper_rig = empty('RIG_REVIEW_PAPER', (0.0, 0.0, 0.0))
    paper = build_curved_paper(paper_mat)
    ensure_parent(paper, paper_rig)

    # Folded lower-right edge, still blank: review wording remains semantic HTML.
    fold = bevel_cube('GEO_REVIEW_FOLD', (0.78, 0.34, 0.035), (0.90, -0.72, 0.245), paper_edge, bevel=0.025, segments=3)
    fold.rotation_euler[2] = -0.08
    ensure_parent(fold, paper_rig)

    clip = bevel_cube('GEO_REVIEW_CLIP', (0.34, 0.095, 0.075), (-1.13, 0.77, 0.31), brass, bevel=0.035, segments=4)
    clip.rotation_euler[2] = -0.16
    ensure_parent(clip, paper_rig)

    # A short spoon fragment is enough to provide a familiar café scale cue.
    spoon = tube_curve(
        'GEO_REVIEW_SPOON',
        [(0.65, -0.72, 0.30), (0.96, -0.78, 0.31), (1.28, -0.82, 0.315), (1.52, -0.86, 0.32)],
        0.032,
        brass,
        resolution=5,
        bevel_resolution=3,
    )
    ensure_parent(spoon, paper_rig)
    spoon_bowl = flattened_sphere('GEO_REVIEW_SPOON_BOWL', (1.70, -0.89, 0.325), (0.24, 0.14, 0.045), brass, segments=32, rings=16)
    spoon_bowl.rotation_euler[2] = -0.14
    ensure_parent(spoon_bowl, paper_rig)

    # Subtle coffee-ring geometry: a physical trace, not decorative text.
    bpy.ops.mesh.primitive_torus_add(major_radius=0.28, minor_radius=0.018, major_segments=64, minor_segments=10, location=(-0.62, -0.43, 0.29))
    ring = bpy.context.active_object
    ring.name = 'GEO_REVIEW_COFFEE_RING'
    ring.scale = (1.05, 0.82, 0.28)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    add_material(ring, coffee)
    ensure_parent(ring, paper_rig)

    # Blender-authored motion: enter from a readable edge angle and settle face-on.
    paper_rig.location = (0.06, 0.0, 0.34)
    paper_rig.rotation_euler = (math.radians(54), math.radians(-7), math.radians(-4))
    paper_rig.keyframe_insert(data_path='location', frame=1)
    paper_rig.keyframe_insert(data_path='rotation_euler', frame=1)

    paper_rig.location = (0.0, 0.0, 0.03)
    paper_rig.rotation_euler = (math.radians(7), math.radians(-2), math.radians(1.5))
    paper_rig.keyframe_insert(data_path='location', frame=100)
    paper_rig.keyframe_insert(data_path='rotation_euler', frame=100)

    if paper_rig.animation_data and paper_rig.animation_data.action:
        action = paper_rig.animation_data.action
        action.name = 'ACT_REVIEW_PAPER_TURN'
        for curve in action.fcurves:
            for point in curve.keyframe_points:
                point.interpolation = 'BEZIER'

    paper_rig['role'] = 'review-paper'
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 100
    # The approved static frame is the settled, face-on end state.
    bpy.context.scene.frame_set(100)
    export_glb(parse_output())


if __name__ == '__main__':
    build()
