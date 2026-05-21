#!/usr/bin/env python3
"""Export UPGRADE Dispatch equipment source .blend files to optimized GLB.

Run from Blender, for example:
blender -b "source-assets/dispatch/Chiler v.2.blend" --python scripts/blender/export-dispatch-assets.py -- chiller
"""

from __future__ import annotations

import sys
from pathlib import Path

try:
    import bpy  # type: ignore
except ImportError:
    print("This script must be executed by Blender's Python runtime.")
    sys.exit(2)


ASSETS = {
    "chiller": {
        "output": "public/models/dispatch/chiller.glb",
        "groups": [
            "chillerShellGroup",
            "compressorGroup",
            "heatExchangerGroup",
            "fanGroup",
            "pipeGroup",
            "removablePanelsGroup",
            "fastenersGroup",
        ],
    },
    "cooling-tower-small": {
        "output": "public/models/dispatch/cooling-tower-small.glb",
        "groups": [
            "towerShellGroup",
            "fanGroup",
            "fillPackGroup",
            "basinGroup",
            "sprayPipeGroup",
            "removablePanelsGroup",
        ],
    },
    "fancoil-fc92": {
        "output": "public/models/dispatch/fancoil-fc92.glb",
        "groups": [
            "fancoilShellGroup",
            "frontPanelGroup",
            "filterGroup",
            "fanGroup",
            "coilGroup",
            "drainTrayGroup",
            "pipeGroup",
        ],
    },
    "multi-split-system": {
        "output": "public/models/dispatch/multi-split-system.glb",
        "groups": [
            "multiSplitOutdoorUnitGroup",
            "multiSplitIndoorUnitsGroup",
            "compressorGroup",
            "fanGroup",
            "coilGroup",
            "pipeRoutesGroup",
            "removablePanelsGroup",
        ],
    },
}


def get_asset_id() -> str:
    if "--" not in sys.argv:
        print("Missing asset id after --. Expected one of: " + ", ".join(sorted(ASSETS)))
        sys.exit(2)

    args = sys.argv[sys.argv.index("--") + 1 :]
    if not args or args[0] not in ASSETS:
        print("Invalid asset id. Expected one of: " + ", ".join(sorted(ASSETS)))
        sys.exit(2)

    return args[0]


def remove_scene_helpers() -> None:
    for obj in list(bpy.context.scene.objects):
        if obj.type in {"CAMERA", "LIGHT"}:
            bpy.data.objects.remove(obj, do_unlink=True)


def apply_mesh_transforms() -> None:
    bpy.ops.object.select_all(action="DESELECT")
    for obj in bpy.context.scene.objects:
        if obj.type == "MESH":
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj

    if bpy.context.selected_objects:
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)


def set_origin_to_scene_base() -> None:
    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not mesh_objects:
        print("No mesh objects found in source blend.")
        sys.exit(2)

    min_x = min(obj.bound_box[0][0] + obj.location.x for obj in mesh_objects)
    max_x = max(obj.bound_box[6][0] + obj.location.x for obj in mesh_objects)
    min_y = min(obj.bound_box[0][1] + obj.location.y for obj in mesh_objects)
    max_y = max(obj.bound_box[6][1] + obj.location.y for obj in mesh_objects)
    min_z = min(obj.bound_box[0][2] + obj.location.z for obj in mesh_objects)

    bpy.context.scene.cursor.location = ((min_x + max_x) / 2, (min_y + max_y) / 2, min_z)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.origin_set(type="ORIGIN_CURSOR", center="MEDIAN")


def warn_missing_groups(asset_id: str) -> None:
    existing_names = {obj.name for obj in bpy.context.scene.objects}
    missing = [name for name in ASSETS[asset_id]["groups"] if name not in existing_names]
    if missing:
        print("Warning: expected normalized groups are missing:")
        for name in missing:
            print(f"  - {name}")
        print("Export will continue, but exploded transforms rely on these names.")


def export_glb(asset_id: str) -> None:
    repo_root = Path.cwd()
    output_path = repo_root / ASSETS[asset_id]["output"]
    output_path.parent.mkdir(parents=True, exist_ok=True)

    remove_scene_helpers()
    apply_mesh_transforms()
    set_origin_to_scene_base()
    warn_missing_groups(asset_id)

    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        export_apply=True,
        export_materials="EXPORT",
        export_yup=True,
    )
    print(f"Exported {asset_id} to {output_path}")


if __name__ == "__main__":
    export_glb(get_asset_id())
