import bpy
import math
import os
from mathutils import Vector


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        # Keep the collections alive while the scene is being built; unused blocks are cleaned on exit.
        pass


def set_input(node, names, value):
    for name in names:
        socket = node.inputs.get(name)
        if socket is not None:
            socket.default_value = value
            return


def principled_material(name, color, roughness=0.5, metallic=0.0, coat=0.0, coat_roughness=0.5):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    set_input(bsdf, ['Base Color'], (*color, 1.0))
    set_input(bsdf, ['Roughness'], roughness)
    set_input(bsdf, ['Metallic'], metallic)
    set_input(bsdf, ['Coat Weight', 'Clearcoat'], coat)
    set_input(bsdf, ['Coat Roughness', 'Clearcoat Roughness'], coat_roughness)
    return mat


def add_material(obj, material):
    if obj.data and hasattr(obj.data, 'materials'):
        obj.data.materials.append(material)


def smooth(obj):
    if obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True


def lathe(name, profile, material, steps=96):
    """Create a revolved custom cross-section around Z.

    `profile` is a list of (radius, z) points forming a closed shell/cross-section.
    """
    mesh = bpy.data.meshes.new(f'{name}_Mesh')
    verts = [(r, 0.0, z) for r, z in profile]
    edges = [(i, i + 1) for i in range(len(verts) - 1)]
    mesh.from_pydata(verts, edges, [])
    mesh.update()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    modifier = obj.modifiers.new('Revolve', 'SCREW')
    modifier.axis = 'Z'
    modifier.angle = math.tau
    modifier.steps = steps
    modifier.render_steps = steps
    modifier.use_merge_vertices = True
    modifier.merge_threshold = 0.0001

    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.select_set(False)
    smooth(obj)
    add_material(obj, material)
    return obj


def bevel_cube(name, dimensions, location, material, bevel=0.08, segments=5):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    bev = obj.modifiers.new('Soft edges', 'BEVEL')
    bev.width = bevel
    bev.segments = segments
    bev.limit_method = 'ANGLE'
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=bev.name)
    add_material(obj, material)
    return obj


def tube_curve(name, points, radius, material, resolution=4, bevel_resolution=4):
    curve = bpy.data.curves.new(f'{name}_Curve', type='CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = resolution
    curve.bevel_depth = radius
    curve.bevel_resolution = bevel_resolution
    curve.resolution_u = resolution

    spline = curve.splines.new('BEZIER')
    spline.bezier_points.add(len(points) - 1)
    for point, coord in zip(spline.bezier_points, points):
        point.co = coord
        point.handle_left_type = 'AUTO'
        point.handle_right_type = 'AUTO'

    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    add_material(obj, material)
    return obj


def flattened_sphere(name, location, scale, material, segments=48, rings=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth(obj)
    add_material(obj, material)
    return obj


def make_napkin(name, location, scale, material):
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=16, y_subdivisions=16, size=2.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    for vert in obj.data.vertices:
        x, y, z = vert.co
        vert.co.z = 0.025 * math.sin(x * 3.2) + 0.018 * math.cos(y * 4.1) + 0.014 * x

    solid = obj.modifiers.new('Paper thickness', 'SOLIDIFY')
    solid.thickness = 0.018
    solid.offset = 0
    subd = obj.modifiers.new('Soft folds', 'SUBSURF')
    subd.levels = 1
    subd.render_levels = 1
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=solid.name)
    bpy.ops.object.modifier_apply(modifier=subd.name)
    smooth(obj)
    add_material(obj, material)
    return obj


def ensure_parent(child, parent):
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()


def empty(name, location=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = 'PLAIN_AXES'
    obj.location = location
    bpy.context.collection.objects.link(obj)
    return obj


def export_glb(filepath):
    filepath = os.path.abspath(filepath)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT',
        export_animations=True,
        export_cameras=False,
        export_lights=False,
    )
    print(f'Exported GLB: {filepath}')
