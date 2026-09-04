import bpy
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.append(SCRIPT_DIR)

from common import export_glb


def parse_args():
    args = sys.argv
    if '--' in args:
        args = args[args.index('--') + 1:]
    input_path = None
    output_path = None
    for index, arg in enumerate(args):
        if arg == '--input' and index + 1 < len(args):
            input_path = args[index + 1]
        if arg == '--output' and index + 1 < len(args):
            output_path = args[index + 1]
    if not input_path or not output_path:
        raise RuntimeError('why_motion.py requires --input <glb> --output <glb>')
    return os.path.abspath(input_path), os.path.abspath(output_path)


def make_rig(name, object_names):
    rig = bpy.data.objects.new(name, None)
    rig.empty_display_type = 'PLAIN_AXES'
    bpy.context.collection.objects.link(rig)

    found = []
    for object_name in object_names:
        obj = bpy.data.objects.get(object_name)
        if obj is None:
            raise RuntimeError(f'Missing Why object for motion: {object_name}')
        matrix = obj.matrix_world.copy()
        obj.parent = rig
        obj.matrix_world = matrix
        found.append(obj)
    return rig, found


def make_prefix_rig(name, prefixes):
    names = [obj.name for obj in bpy.data.objects if any(obj.name.startswith(prefix) for prefix in prefixes)]
    if not names:
        raise RuntimeError(f'No objects found for rig {name}: {prefixes}')
    return make_rig(name, names)


def keyframe_motion(rig, action_name, start_location=(0, 0, 0), end_location=(0, 0, 0), start_rotation=(0, 0, 0), end_rotation=(0, 0, 0)):
    rig.location = start_location
    rig.rotation_euler = start_rotation
    rig.keyframe_insert(data_path='location', frame=1)
    rig.keyframe_insert(data_path='rotation_euler', frame=1)

    rig.location = end_location
    rig.rotation_euler = end_rotation
    rig.keyframe_insert(data_path='location', frame=100)
    rig.keyframe_insert(data_path='rotation_euler', frame=100)

    action = rig.animation_data.action if rig.animation_data else None
    if action is None:
        raise RuntimeError(f'Animation action missing for {rig.name}')
    action.name = action_name
    for curve in action.fcurves:
        for point in curve.keyframe_points:
            point.interpolation = 'BEZIER'



def build_motion():
    input_path, output_path = parse_args()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=input_path)

    # Plate: frame 1 is intentionally lightly exploded; frame 100 is the approved assembled still life.
    toast, _ = make_rig('RIG_WHY_PLATE_TOAST', ['WHY_PLATE_TOAST_A', 'WHY_PLATE_TOAST_B'])
    egg, _ = make_rig('RIG_WHY_PLATE_EGG', ['WHY_PLATE_EGG_WHITE', 'WHY_PLATE_YOLK'])
    avo, _ = make_prefix_rig('RIG_WHY_PLATE_AVO', ['WHY_PLATE_AVO_'])
    tomato, _ = make_prefix_rig('RIG_WHY_PLATE_TOMATO', ['WHY_PLATE_TOMATO_'])
    herb, _ = make_prefix_rig('RIG_WHY_PLATE_HERB', ['WHY_PLATE_HERB_'])

    keyframe_motion(toast, 'ACT_WHY_PLATE_ASSEMBLE_TOAST', (-0.22, 0.10, 0.44), (0, 0, 0), (0, 0, -0.10), (0, 0, 0))
    keyframe_motion(egg, 'ACT_WHY_PLATE_ASSEMBLE_EGG', (0.14, -0.08, 0.54), (0, 0, 0), (0, 0, 0.06), (0, 0, 0))
    keyframe_motion(avo, 'ACT_WHY_PLATE_ASSEMBLE_AVO', (0.36, 0.18, 0.30), (0, 0, 0), (0, 0, 0.10), (0, 0, 0))
    keyframe_motion(tomato, 'ACT_WHY_PLATE_ASSEMBLE_TOMATO', (0.18, -0.20, 0.22), (0, 0, 0), (0, 0, -0.08), (0, 0, 0))
    keyframe_motion(herb, 'ACT_WHY_PLATE_ASSEMBLE_HERB', (-0.05, 0.20, 0.28), (0, 0, 0), (0, 0, 0.08), (0, 0, 0))

    # Welcome: approved static frame is frame 1. Motion gently opens the chair and nudges the coffee toward the viewer.
    chair, _ = make_prefix_rig('RIG_WHY_WELCOME_CHAIR', ['WHY_WELCOME_CHAIR_'])
    cup, _ = make_rig('RIG_WHY_WELCOME_CUP', [
        'WHY_WELCOME_SAUCER',
        'WHY_WELCOME_CUP',
        'WHY_WELCOME_COFFEE',
        'WHY_WELCOME_HANDLE',
        'WHY_WELCOME_SPOON_HANDLE',
        'WHY_WELCOME_SPOON_BOWL',
    ])
    keyframe_motion(chair, 'ACT_WHY_CHAIR_OPEN', (0, 0, 0), (0.34, -0.16, 0.02), (0, 0, 0), (0, 0, -0.055))
    keyframe_motion(cup, 'ACT_WHY_CUP_WELCOME', (0, 0, 0), (-0.03, -0.16, 0.05), (0, 0, 0), (0, 0, 0.025))

    # Local find: a tiny physical reveal rather than a theatrical door swing.
    door, _ = make_rig('RIG_WHY_FIND_DOOR', ['WHY_FIND_DOOR'])
    keyframe_motion(door, 'ACT_WHY_DOOR_REVEAL', (0, 0, 0), (0.34, -0.12, 0.03), (0, 0, 0), (0, 0, -0.045))

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 100
    bpy.context.scene.frame_set(1)
    export_glb(output_path)


if __name__ == '__main__':
    build_motion()
