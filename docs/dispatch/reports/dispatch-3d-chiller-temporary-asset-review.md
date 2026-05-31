# Dispatch Chiller 3D Temporary Asset Review

Date: 2026-05-30  
Branch: `fix/dispatch-3d-equipment-models-and-selection`  
Preview checked: <https://upgradefor-page-generator-ivpryfet3-bacalimser-8615s-projects.vercel.app/dispatch>  
Asset: `public/models/dispatch/chiller.glb`

## Scope

This is a focused technical and visual triage for the current chiller model used in the read-only dispatch demo. It does
not replace source geometry, does not add a new chiller model, does not enable a production command path, and does not
claim live BMS/SCADA control.

The current product rule remains:

```text
current chiller = temporary assembled-only asset
exploded view = gated with "Разборка модели в подготовке"
future replacement = separate 3D source/model PR
```

## Evidence

Serving check with cache busting:

```text
/dispatch?cb=<timestamp> -> 200
/models/dispatch/chiller.glb?cb=<timestamp> -> 200 model/gltf-binary 1122372 bytes
```

Browser check:

```text
active=chiller
aria-current=true
heading=Чиллер CH-1
canvasCount=2
fallback=false
explodedGate=true
safetyReadOnly=true
```

Screenshot:

```text
/Users/m1/UPGRADE/upgradefor-page-generator/runtime/dispatch-continuous/screenshots/cycle-018/chiller-fresh-preview-viewer.png
```

GLB structure:

```text
fileSize=1.07 MB
meshNodes=16
meshCount=16
primitives=16
materials=5
vertices=40,918
bounds=1.0385 x 1.1837 x 4.15
missingNormalPrimitives=16
tinyMeshes=5
```

Materials exported in the GLB:

```text
dispatch_chiller_shell_clean_white
dispatch_chiller_brushed_steel
dispatch_chiller_dark_grille
dispatch_chiller_graphite_fans
dispatch_chiller_panel_cool_grey
```

## Visual Decision

Current status: **temporary demo asset, assembled-only**.

Why it can stay in the current demo:

- The GLB is served from the preview with HTTP 200.
- The equipment twin viewer selects `chiller`, updates the heading to `Чиллер CH-1`, and keeps a 3D canvas mounted.
- The model does not show the fallback state.
- The asset reads as an assembled air-cooled chiller: long casing, side grille/coil area, top fans, lower frame, and
  service-side panels.
- The file is lightweight enough for the current preview.

Why it should not be polished further in this branch:

- All 16 primitives are missing exported `NORMAL` attributes, so lighting/shading quality can be inconsistent.
- The GLB inspector reports 5 tiny mesh nodes that should be reviewed in a dedicated source cleanup pass.
- The asset is marked `TO VERIFY` in passport metadata.
- Exploded mode is not approved and must remain gated.

## Product Copy Rule

Use only safe phrasing around this asset:

- `Temporary demo asset`
- `Assembled-only`
- `Read-only`
- `No real equipment control`
- `Разборка модели в подготовке`

Avoid:

- `production-ready chiller twin`
- `manufacturer verified`
- `exploded model approved`
- any claim that the model controls real BMS/SCADA equipment.

## Next Step

Keep the current chiller visible in assembled mode for the investor demo. If the chiller becomes a priority, replace or
repair it in a separate 3D source/modeling cycle focused on normals, fragments, material fidelity, and a separately
approved exploded breakdown.
