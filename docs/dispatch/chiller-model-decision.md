# Chiller CH-1 Model Decision

## 1. Current Model Status

Status: PARTIAL

The current asset, `public/models/dispatch/chiller.glb`, is recognizable as an industrial air-cooled chiller in the assembled/default view. It is small enough for the web app and is centered well enough for the current viewer. It should not be accepted as the final model because the exploded/disassembled view exposes poor-quality grouped fragments and does not look like a controlled service-ready equipment breakdown.

QA target:
- Source branch asset: `feat/dispatch-real-hvac-glb-assets`
- Source commit: `679a694`
- Source file: Google Drive / `Чиллер 13.10.2022` / `Chiler v.2.blend`
- Inspected file: `public/models/dispatch/chiller.glb`

## 2. Assembled View

Decision: accepted as temporary preview

Notes:
- Recognizable industrial chiller silhouette.
- Top fans, white shell, base frame, and dark grille/heat-exchange zone are visible.
- Model is usable for investor/demo preview as an assembled object.
- Materials are acceptable for a temporary preview, but not polished enough for final product visuals.

## 3. Exploded View

Decision: fail

Notes:
- The exploded state looks like displaced shell/grille fragments rather than meaningful service modules.
- Internal equipment is not cleanly authored or visually readable.
- The side grille / thermal belt / heat-exchange zone becomes visually messy when separated.
- The exploded label and controls technically work, but the visual result should not be shown as a finished demo state.

## 4. Artifact Analysis

Artifacts are visible mainly in the exploded/disassembled state around:
- side grille / heat-exchange zone;
- top fan and frame pieces;
- separated shell/panel fragments;
- small loose pieces near the chiller ends.

Likely cause:
- source `.blend` contamination or leftover CAD fragments;
- duplicate or hidden junk objects carried from the source scene;
- grouping that is good enough for whole-model display but not authored for a clean exploded view;
- viewer transforms moving broad imported groups rather than true service subassemblies;
- missing exported normals causing inconsistent shading quality in some areas.

Static QA findings:
- File size: 1.07 MB.
- Mesh nodes: 16.
- Materials: 5.
- Cameras/lights: 0.
- Bounding size: 1.0385 x 1.1837 x 4.15.
- Center offset from origin: 0.1681.
- Tiny mesh nodes detected: 5.
- Missing normals: 16/16 primitives.
- Assembled suitability: likely OK.
- Exploded suitability: requires visual QA, failed visually.

## 5. Cleanup Estimate

Cleanup estimate: Not worth cleaning

The assembled model could be kept temporarily, but making the exploded view presentation-grade would likely require returning to Blender and manually authoring clean groups, normals, and service modules. That is not a quick cleanup for this source asset.

## 6. Recommendation

Recommendation: Replace with another chiller model

Temporary safety applied in this branch:
- keep the assembled chiller visible;
- disable the chiller exploded toggle only;
- show `Разборка модели в подготовке`;
- leave PV-1, Cooling Tower, Fancoil, and Multi Split behavior unchanged.

## 7. Replacement Requirements

Replacement chiller model requirements:
- industrial air-cooled chiller or Trane-like unit;
- clean GLB, FBX, or Blender source;
- no random scene junk;
- visible top fans;
- visible side coils/grilles;
- clean body/shell;
- file size ideally under 10 MB after export, hard limit under 25 MB;
- license/usage safe for demo;
- assembled view first;
- exploded internals optional for now.

Target replacement path:
- `public/models/dispatch/chiller.glb`

## 8. Visual QA Evidence

Preview inspected:
- `https://upgradefor-page-generator-pytjrl85j-bacalimser-8615s-projects.vercel.app/dispatch`

Captured screenshots:
- `/tmp/dispatch-chiller-full-page-passport.png`
- `/tmp/dispatch-chiller-assembled-side-full.png`
- `/tmp/dispatch-chiller-assembled-top-full.png`
- `/tmp/dispatch-chiller-exploded-front-full.png`
- `/tmp/dispatch-chiller-exploded-side-full.png`
- `/tmp/dispatch-chiller-artifact-zone.png`
- `/tmp/dispatch-chiller-exploded-gated-local.png`

Console findings:
- No crash was observed.
- Existing Three.js deprecation warnings were present for `THREE.Clock` and `THREE.WebGLShadowMap`.

## 9. Final CTO Recommendation

Keep the current CH-1 asset only as an assembled temporary preview, but do not invest more time polishing its exploded state. The best path is to replace it with a cleaner approved chiller model and keep the current UI honest by disabling the chiller disassembly state until a properly authored replacement is ready.
