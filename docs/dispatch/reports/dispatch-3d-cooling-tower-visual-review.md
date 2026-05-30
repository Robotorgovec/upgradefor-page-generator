# Dispatch Cooling Tower 3D Visual Review

Date: 2026-05-30  
Branch: `fix/dispatch-3d-equipment-models-and-selection`  
Preview checked: <https://upgradefor-page-generator-rl8c1q2s1-bacalimser-8615s-projects.vercel.app/dispatch>  
Asset: `public/models/dispatch/cooling-tower-small.glb`

## Scope

This is a focused visual/material review for the current cooling tower model used in the read-only dispatch demo. It
does not replace source geometry, does not add production control, and does not claim live telemetry.

## Evidence

Browser check:

```text
active=cooling-tower-small
heading=Градирня CT-1
canvas=1
fallback=false
```

Screenshot:

```text
/Users/m1/UPGRADE/upgradefor-page-generator/runtime/dispatch-continuous/screenshots/cycle-017/cooling-tower-lower-twin-verified.png
```

GLB structure:

```text
fileSize=323.3 KB
meshNodes=7
meshCount=7
primitives=7
materials=4
vertices=59,794
bounds=0.75 x 0.824 x 3.15
warnings=none
```

Materials exported in the GLB:

```text
dispatch_dark_grille
dispatch_clean_warm_shell
dispatch_copper_pipe
dispatch_brushed_metal
```

## Visual Decision

Current status: **demo accepted with caveats**.

Why:

- The model is browser-visible in the lower 3D equipment twin block.
- The selected card is `cooling-tower-small`, the heading changes to `Градирня CT-1`, and the viewer does not show
  fallback.
- The model reads as an assembled cooling tower: elongated body, multiple top fans, support legs, dark fan grilles, and
  copper pipe runs.
- The GLB inspector reports no structural warnings.
- It is lightweight enough for the current preview.

Limits:

- The asset remains a demo registry model, not manufacturer-verified equipment.
- Exploded view should stay gated until a separate source/modeling pass creates an approved breakdown.
- Final roof/site placement should use explicit transforms if this asset is later moved into a full building scene.

## Product Copy Rule

Use only safe phrasing around this asset:

- `Demo/read-only`
- `No real equipment control`
- `Demo accepted with caveats`

Avoid:

- `manufacturer verified`
- `production-ready twin`
- any claim that the model controls real BMS/SCADA equipment.

## Next Step

Keep this cooling tower as the current demo asset. The next 3D quality pass should target either chiller normals or PV-1
scene placement, not this cooling tower.
