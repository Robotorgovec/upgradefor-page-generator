# Dispatch Multi-Split 3D Visual Review

Date: 2026-05-30  
Branch: `fix/dispatch-3d-equipment-models-and-selection`  
Preview checked: <https://upgradefor-page-generator-2l9sdi5k6-bacalimser-8615s-projects.vercel.app/dispatch>
Asset: `public/models/dispatch/multi-split-system.glb`
Approved Drive source: `Не терять, не удалять, хранить!/Мульти сплит система 05.11.2022/Multi split system.blend`

## Scope

This is a focused visual/material acceptance pass for the current multi-split / кондиционер model used in the read-only
dispatch demo. It does not replace source geometry, does not invent a procedural model, does not add production control,
and does not claim live BMS/SCADA telemetry.

No re-export was performed in this cycle. The current GLB remains unchanged because it is browser-visible, has real
multi-split elements, and is acceptable for the demo with caveats.

## Approved Source Evidence

Drive folder inspected:

```text
/Users/m1/Library/CloudStorage/GoogleDrive-bacalim.ser@gmail.com/Мой диск/Не терять, не удалять, хранить!/Мульти сплит система 05.11.2022
```

Files found:

```text
002.png
168.png
169.png
Multi split system.blend
assets/materials/brick_wall_paint_b0a5dda8-6ccd-43cd-aced-4514ef7a299a/brick_wall_paint_30e680d5-800e-4d1e-b547-137a9a0ed642.blend
assets/models/air_conditioner_996de5e5-1102-4392-a268-e02cfb27ec4c/air_conditioner_1K_f3d54383-8cc0-491d-8bdd-9da42ffa9078.blend
desktop.ini
```

Blender source inspection confirmed the source contains multi-split relevant objects/material groups, including indoor
unit bodies, face covers, grille/fan objects, copper pipe objects, and air-conditioner source assets. The inspection log
is kept locally at:

```text
/Users/m1/UPGRADE/upgradefor-page-generator/runtime/dispatch-continuous/asset-audit/cycle-019/multi-split-blender-inspect.log
```

## Evidence

Serving check with cache busting:

```text
/dispatch?cb=<timestamp> -> 200
/models/dispatch/multi-split-system.glb?cb=<timestamp> -> 200 model/gltf-binary 307264 bytes
```

Browser check:

```text
active=multi-split-system
aria-current=true
heading=Мультисплит система MS-1
canvasCount=2
fallback=false
explodedGate=true
safetyReadOnly=true
```

Screenshot committed for external review:

```text
docs/dispatch/reports/screenshots/cycle-019/multi-split-fresh-preview-viewer.png
```

GLB structure:

```text
fileSize=300.1 KB
meshNodes=20
meshCount=20
primitives=20
materials=5
vertices=102,268
bounds=3.2472 x 1.6214 x 0.6046
warning=Bounding-box center is noticeably offset from origin in X/Z.
```

Materials exported in the GLB:

```text
dispatch_dark_grille
dispatch_clean_warm_shell
dispatch_cool_blue_accent
dispatch_brushed_metal
dispatch_copper_pipe
```

## Visual Decision

Current status: **ACCEPTED_FOR_DEMO_WITH_CAVEATS**.

Why it can stay in the current demo:

- The approved Drive source folder exists and was inspected.
- The model is browser-visible in the lower 3D equipment twin block.
- The selected card is `multi-split-system`, the heading changes to `Мультисплит система MS-1`, and the viewer does not
  show fallback.
- The model reads as a simplified assembled multi-split: outdoor fan/grille detail, two indoor units, copper pipe runs,
  and cool blue/white casing materials.
- The GLB has no missing-normal warning and remains lightweight for the current preview.
- Exploded view is gated with `Разборка модели в подготовке`, which is correct for this asset.

Limits:

- Metadata still contains `TO VERIFY`.
- The GLB is off-center, so future scene-level placement should normalize origin or define an explicit transform.
- It is visually simplified and should not be presented as a final manufacturer-accurate equipment twin.
- If client-facing material fidelity becomes a priority, re-export only from the approved Drive source or another
  user-approved original source. Do not substitute procedural/generated geometry.

## Narrow Viewport QA Note

The clean 375px check did not show document-level horizontal overflow:

```text
innerWidth=375
document.scrollWidth=360
body.scrollWidth=360
horizontalOverflow=false
```

However, nested dispatch containers still report overflow (`dispatchShell`, `dispatchGrid`, `dispatchHeader`, and
`twinStage`) and the top PV-1 viewer appears visually cropped/zoomed on the narrow screenshot. This is not fixed in this
3D cycle and should become a separate `MODE=DESIGN` or `MODE=QA` micro-goal.

Screenshot:

```text
docs/dispatch/reports/screenshots/cycle-019/narrow-overflow-observation.png
```

## Product Copy Rule

Use only safe phrasing around this asset:

- `Demo/read-only`
- `No real equipment control`
- `TO VERIFY`
- `ACCEPTED_FOR_DEMO_WITH_CAVEATS`
- `Разборка модели в подготовке`

Avoid:

- `final equipment model`
- `manufacturer verified`
- `production-ready twin`
- any claim that the model controls real BMS/SCADA equipment.

## Next Step

Keep the current multi-split GLB in the demo. The next recommended cycle should be `MODE=QA` for all five equipment
twins, including active/related selection states and lower PV-1 proof, or `MODE=DESIGN` for the narrow viewport crop.
