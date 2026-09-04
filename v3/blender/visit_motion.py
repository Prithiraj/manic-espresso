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
        raise RuntimeError('visit_motion.py requires --input <glb> --output <glb>')
    return os.path.abspath(input_path), os.path.abspath(output_path)


def finish_action(obj, name):
    action = obj.animation_data.action if obj.animation_data else None
    if action is None:
        raise RuntimeError(f'Animation action missing for {obj.name}')
    action.name = name
    for curve in action.fcurves:
        for point in curve.keyframe_points:
            point.interpolation = 'BEZIER'


def build_motion():
    input_path, output_path = parse_args()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=input_path)

    root = bpy.data.objects.get('VISIT_ROOT')
    pin = bpy.data.objects.get('RIG_VISIT_PIN')
    contact = bpy.data.objects.get('VISIT_PIN_CONTACT')
    paper_2 = bpy.data.objects.get('VISIT_PAPER_2')
    paper_3 = bpy.data.objects.get('VISIT_PAPER_3')
    if not all((root, pin, contact, paper_2, paper_3)):
        raise RuntimeError('Visit motion objects missing after GLB import')

    # Keep the contact cue attached to the physical card while the brass pin rises.
    contact_world = contact.matrix_world.copy()
    contact.parent = root
    contact.matrix_world = contact_world

    pin_start = pin.location.copy()
    pin.keyframe_insert(data_path='location', frame=1)
    pin.location.z = pin_start.z + 0.18
    pin.keyframe_insert(data_path='location', frame=100)
    finish_action(pin, 'ACT_VISIT_PIN_RISE')

    # The upper paper sheets open only a few millimetres to echo the HTML hours stack.
    p2_start = paper_2.location.copy()
    p2_rot = paper_2.rotation_euler.copy()
    paper_2.keyframe_insert(data_path='location', frame=1)
    paper_2.keyframe_insert(data_path='rotation_euler', frame=1)
    paper_2.location.y = p2_start.y + 0.045
    paper_2.location.z = p2_start.z + 0.025
    paper_2.rotation_euler.z = p2_rot.z + 0.018
    paper_2.keyframe_insert(data_path='location', frame=100)
    paper_2.keyframe_insert(data_path='rotation_euler', frame=100)
    finish_action(paper_2, 'ACT_VISIT_PAPER_SPREAD_2')

    p3_start = paper_3.location.copy()
    p3_rot = paper_3.rotation_euler.copy()
    paper_3.keyframe_insert(data_path='location', frame=1)
    paper_3.keyframe_insert(data_path='rotation_euler', frame=1)
    paper_3.location.x = p3_start.x + 0.035
    paper_3.location.y = p3_start.y + 0.075
    paper_3.location.z = p3_start.z + 0.045
    paper_3.rotation_euler.z = p3_rot.z - 0.020
    paper_3.keyframe_insert(data_path='location', frame=100)
    paper_3.keyframe_insert(data_path='rotation_euler', frame=100)
    finish_action(paper_3, 'ACT_VISIT_PAPER_SPREAD_3')

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 100
    bpy.context.scene.frame_set(1)
    export_glb(output_path)


if __name__ == '__main__':
    build_motion()
