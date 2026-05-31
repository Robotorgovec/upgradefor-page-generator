# Dispatch 3D Asset Quality Audit

Date: 2026-05-30  
Branch: `fix/dispatch-3d-equipment-models-and-selection`  
Scope: read-only `/dispatch` 3D equipment twin assets only.

## Purpose

This audit records objective GLB structure metrics for the current dispatch equipment models. It does not replace
visual review, does not claim production telemetry, and does not enable real equipment control. The goal is to separate
three questions that were getting mixed together:

1. Is the model served and clickable in the browser?
2. Does the GLB look structurally safe enough for the current demo?
3. Which assets need a later modeling/material pass before they should be polished further?

## Commands

The metrics below were generated with:

```text
node scripts/asset-qa/inspect-glb.mjs <model.glb>
```

Raw JSON reports for this cycle were saved locally under:

```text
/Users/m1/UPGRADE/upgradefor-page-generator/runtime/dispatch-continuous/asset-audit/cycle-013/
```

## Summary

| Asset | Size | Mesh nodes | Primitives | Materials | Vertices | Bounds size | Warnings | Demo status |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| `supply-vent-unit-01-assembled.glb` | 1.69 MB | 42 | 73 | 11 | 509,978 | 24.5719 x 17.91 x 62.2826 | tiny meshes, off-origin center | Use for PV-1; material/color review remains visual |
| `supply-vent-unit-01-exploded.glb` | 2.80 MB | 46 | 81 | 12 | 907,400 | 29.3203 x 17.986 x 62.2826 | tiny meshes, off-origin center | Use for PV-1 exploded only after visual check |
| `chiller.glb` | 1.07 MB | 16 | 16 | 5 | 40,918 | 1.0385 x 1.1837 x 4.15 | missing normals, tiny meshes | Temporary assembled-only; keep exploded gated |
| `fancoil-fc92.glb` | 3.33 MB | 1 | 6 | 6 | 77,140 | 3.2 x 0.5133 x 1.0702 | none | Best current candidate for demo-ready equipment |
| `cooling-tower-small.glb` | 323.3 KB | 7 | 7 | 4 | 59,794 | 0.75 x 0.824 x 3.15 | none | Structurally clean; needs visual/material acceptance |
| `multi-split-system.glb` | 300.1 KB | 20 | 20 | 5 | 102,268 | 3.2472 x 1.6214 x 0.6046 | off-origin center | Accepted for demo with caveats |

## Findings

- All six registered GLB assets are below the 10 MB preferred target and far below the 25 MB hard MVP limit.
- `fancoil-fc92.glb` and `cooling-tower-small.glb` have no structural warnings from the GLB inspector.
- `multi-split-system.glb` is lightweight and browser-safe. Its bounding box center is offset from origin, but the
  focused visual pass confirms it is acceptable for the current demo with caveats.
- `chiller.glb` has no normals on all primitives. Keep it as a temporary assembled-only asset and keep exploded view
  gated with `Разборка модели в подготовке`.
- PV-1 assets are real and detailed, but have tiny meshes and off-origin bounds. This is acceptable for the current
  centered viewer, but any future scene-level mapping should normalize node placement explicitly.

## Current Demo Decision

For the current investor/demo branch:

- Keep all five equipment cards visible and clickable.
- Keep the read-only/simulated safety copy.
- Keep chiller, cooling tower, fan coil, and multi-split exploded views gated unless a separate visual QA pass approves
  them.
- Do not replace source geometry with invented procedural models.
- Treat future 3D work as targeted model/material cleanup, not product UI redesign.

## Next Recommended 3D Micro-Goal

Run a final PR #292 review across all five equipment twins, including lower PV-1 proof, active/related selection states,
passport switching, and the narrow viewport crop note. If the multi-split model needs future material polish, re-export
it only from the approved Drive source recorded in the focused visual review.

Follow-up status: the focused multi-split visual review is recorded in:

```text
docs/dispatch/reports/dispatch-3d-multi-split-visual-review.md
```

Cooling tower follow-up status: the focused CT-1 visual review is recorded in:

```text
docs/dispatch/reports/dispatch-3d-cooling-tower-visual-review.md
```

Chiller follow-up status: the focused CH-1 temporary asset review is recorded in:

```text
docs/dispatch/reports/dispatch-3d-chiller-temporary-asset-review.md
```
