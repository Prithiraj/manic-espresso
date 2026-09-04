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
        raise RuntimeError('cafe_motion.py requires --input <glb> --output <glb>')
    return os.path.abspath(input_path), os.path.abspath(output_path)


def build_motion():
    input_path, output_path = parse_args()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=input_path)

    facade = bpy.data.objects.get('RIG_CAFE_FACADE')
    if facade is None:
        raise RuntimeError('RIG_CAFE_FACADE not found in imported café GLB')

    base_location = facade.location.copy()
    base_rotation = facade.rotation_euler.copy()

    facade.keyframe_insert(data_path='location', frame=1)
    facade.keyframe_insert(data_path='rotation_euler', frame=1)

    # Physical cutaway: slide the façade left and slightly toward the viewer while tipping it a few degrees.
    # The floor, back wall, furniture and counter remain fixed so spatial grounding is preserved.
    facade.location.x = base_location.x - 2.35
    facade.location.y = base_location.y - 0.28
    facade.location.z = base_location.z + 0.10
    facade.rotation_euler.z = base_rotation.z - 0.10
    facade.keyframe_insert(data_path='location', frame=100)
    facade.keyframe_insert(data_path='rotation_euler', frame=100)

    if facade.animation_data and facade.animation_data.action:
        facade.animation_data.action.name = 'ACT_CAFE_CUTAWAY_FACADE'
        for curve in facade.animation_data.action.fcurves:
            for point in curve.keyframe_points:
                point.interpolation = 'BEZIER'

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 100
    bpy.context.scene.frame_set(1)
    export_glb(output_path)


if __name__ == '__main__':
    build_motion()
