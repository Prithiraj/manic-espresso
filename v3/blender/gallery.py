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
    return os.path.join(SCRIPT_DIR, '..', 'public', 'models', 'manic-gallery.glb')


def add_photo_backing(name, dimensions, location, rotation, paper, edge):
    root = empty(f'{name}_ROOT', location)
    back = bevel_cube(f'{name}_BACK', dimensions, location, edge, bevel=0.08, segments=5)
    back.rotation_euler[2] = rotation
    ensure_parent(back, root)
    inset_location = (location[0], location[1], location[2] + dimensions[2] * 0.58)
    inset = bevel_cube(
        f'{name}_INSET',
        (dimensions[0] * 0.93, dimensions[1] * 0.91, max(0.022, dimensions[2] * 0.34)),
        inset_location,
        paper,
        bevel=0.06,
        segments=4,
    )
    inset.rotation_euler[2] = rotation
    ensure_parent(inset, root)
    root.rotation_euler[2] = 0.0
    return root


def add_spoon(brass):
    root = empty('GALLERY_SPOON_ROOT', (-1.55, -1.15, 0.10))
    handle = tube_curve(
        'GALLERY_SPOON_HANDLE',
        [(-2.00, -1.35, 0.08), (-1.58, -1.18, 0.075), (-1.08, -0.97, 0.075), (-0.63, -0.83, 0.08)],
        0.035,
        brass,
        resolution=6,
        bevel_resolution=4,
    )
    bowl = flattened_sphere('GALLERY_SPOON_BOWL', (-0.40, -0.76, 0.09), (0.30, 0.19, 0.055), brass, segments=40, rings=20)
    bowl.rotation_euler[2] = 0.31
    ensure_parent(handle, root)
    ensure_parent(bowl, root)
    return root


def add_flower(stem_mat, rose, brass):
    root = empty('GALLERY_FLOWER_ROOT', (-1.78, 1.05, 0.07))
    stem = tube_curve(
        'GALLERY_FLOWER_STEM',
        [(-1.92, 0.72, 0.06), (-1.72, 0.98, 0.20), (-1.58, 1.20, 0.42), (-1.42, 1.38, 0.58)],
        0.014,
        stem_mat,
        resolution=5,
        bevel_resolution=3,
    )
    ensure_parent(stem, root)
    center = flattened_sphere('GALLERY_FLOWER_CENTER', (-1.41, 1.39, 0.61), (0.06, 0.06, 0.045), brass, segments=20, rings=10)
    ensure_parent(center, root)
    for index, angle in enumerate([0, 60, 120, 180, 240, 300]):
        rad = math.radians(angle)
        petal = flattened_sphere(
            f'GALLERY_FLOWER_PETAL_{index+1}',
            (-1.41 + math.cos(rad) * 0.09, 1.39 + math.sin(rad) * 0.09, 0.625),
            (0.075, 0.042, 0.026),
            rose,
            segments=18,
            rings=10,
        )
        petal.rotation_euler[2] = rad
        ensure_parent(petal, root)
    return root


def add_coffee_ring(ring_mat):
    bpy.ops.mesh.primitive_torus_add(
        major_segments=96,
        minor_segments=10,
        location=(1.47, -0.42, 0.045),
        major_radius=0.43,
        minor_radius=0.018,
    )
    ring = bpy.context.active_object
    ring.name = 'GALLERY_COFFEE_RING'
    ring.scale.y = 0.92
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    add_material(ring, ring_mat)
    smooth(ring)
    return ring


def add_torn_paper(paper):
    verts = [
        (-2.10, -1.42, 0.06),
        (-1.18, -1.44, 0.06),
        (-1.08, -1.20, 0.06),
        (-1.19, -0.99, 0.06),
        (-1.43, -1.02, 0.06),
        (-1.63, -0.97, 0.06),
        (-1.80, -1.03, 0.06),
        (-2.05, -0.96, 0.06),
    ]
    faces = [tuple(range(len(verts)))]
    mesh = bpy.data.meshes.new('GALLERY_TORN_PAPER_MESH')
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new('GALLERY_TORN_PAPER', mesh)
    bpy.context.collection.objects.link(obj)
    add_material(obj, paper)
    solid = obj.modifiers.new('Paper thickness', 'SOLIDIFY')
    solid.thickness = 0.022
    solid.offset = 0
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=solid.name)
    return obj


def build():
    clear_scene()

    timber = principled_material('MAT_GALLERY_TIMBER', (0.46, 0.31, 0.20), roughness=0.77)
    timber_edge = principled_material('MAT_GALLERY_TIMBER_EDGE', (0.34, 0.22, 0.14), roughness=0.74)
    paper = principled_material('MAT_GALLERY_PAPER', (0.94, 0.90, 0.83), roughness=0.94)
    backing = principled_material('MAT_GALLERY_BACKING', (0.83, 0.77, 0.68), roughness=0.88)
    brass = principled_material('MAT_GALLERY_BRASS', (0.49, 0.28, 0.10), roughness=0.36, metallic=0.74)
    stem = principled_material('MAT_GALLERY_STEM', (0.16, 0.24, 0.15), roughness=0.72)
    rose = principled_material('MAT_GALLERY_ROSE', (0.50, 0.20, 0.24), roughness=0.60)
    ring_mat = principled_material('MAT_GALLERY_RING', (0.18, 0.095, 0.045), roughness=0.92)

    root = empty('GALLERY_ROOT')
    tabletop = bevel_cube('GALLERY_TABLETOP', (5.35, 3.85, 0.24), (0.0, 0.0, -0.18), timber, bevel=0.16, segments=7)
    ensure_parent(tabletop, root)
    edge = bevel_cube('GALLERY_TABLE_EDGE', (5.05, 3.55, 0.055), (0.0, 0.0, -0.035), timber_edge, bevel=0.12, segments=6)
    ensure_parent(edge, root)

    wide = add_photo_backing('GALLERY_CARD_WIDE', (2.92, 1.82, 0.065), (-0.58, 0.25, 0.05), -0.055, paper, backing)
    tall = add_photo_backing('GALLERY_CARD_TALL', (1.18, 1.72, 0.065), (1.34, 0.62, 0.085), 0.075, paper, backing)
    food = add_photo_backing('GALLERY_CARD_FOOD', (1.55, 0.98, 0.065), (0.92, -0.88, 0.11), -0.07, paper, backing)
    for item in (wide, tall, food):
        ensure_parent(item, root)

    spoon = add_spoon(brass)
    flower = add_flower(stem, rose, brass)
    ring = add_coffee_ring(ring_mat)
    torn = add_torn_paper(paper)
    for item in (spoon, flower, ring, torn):
        ensure_parent(item, root)

    root['role'] = 'gallery-photo-table'
    wide['role'] = 'photo-backing-wide'
    tall['role'] = 'photo-backing-tall'
    food['role'] = 'photo-backing-food'

    export_glb(parse_output())


if __name__ == '__main__':
    build()
