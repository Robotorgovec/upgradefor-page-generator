# Dispatch Multi-Split 3D Visual Review

Date: 2026-05-30  
Branch: `fix/dispatch-3d-equipment-models-and-selection`  
Preview checked: <https://upgradefor-page-generator-4g9m48g82-bacalimser-8615s-projects.vercel.app/dispatch>  
Asset: `public/models/dispatch/multi-split-system.glb`

## Scope

This is a focused visual/material review for the current multi-split model used in the read-only dispatch demo. It does
not replace the source geometry, does not add production control, and does not claim live telemetry.

## Evidence

Browser check:

```text
active=multi-split-system
heading=Мультисплит система MS-1
canvas=1
fallback=false
```

Screenshot:

```text
/Users/m1/UPGRADE/upgradefor-page-generator/runtime/dispatch-continuous/screenshots/cycle-014/multi-split-lower-twin-verified.png
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

Current status: **conditional demo acceptance**.

Why:

- The model is browser-visible in the lower 3D equipment twin block.
- The card selection is correct: the selected card is `multi-split-system`, the heading changes to `Мультисплит система MS-1`, and the viewer does not show fallback.
- The model reads as a simplified multi-split concept: two indoor units, copper pipe runs, dark grille/fan detail, and cool blue accent surfaces.
- It is lightweight enough for the current preview and has no missing-normal warning.

Limits:

- Metadata still contains `TO VERIFY`.
- The GLB is off-center, so future scene-level placement should normalize origin or define an explicit transform.
- The model is visually simple and should not be presented as final manufacturer-accurate equipment.
- Outdoor condenser accuracy and final material realism require source approval before client-facing polish.

## Product Copy Rule

Use only safe phrasing around this asset:

- `Demo/read-only`
- `No real equipment control`
- `TO VERIFY`
- `Conditional 3D visual`

Avoid:

- `final equipment model`
- `manufacturer verified`
- `production-ready twin`
- any claim that the model controls real BMS/SCADA equipment.

## Next Step

If the user wants this model to become final, replace or refine it only from a user-approved original source model. Do not
invent a new procedural multi-split as a substitute.
