# Dispatch 3D Equipment Preview QA

Date: 2026-05-30  
Branch: `fix/dispatch-3d-equipment-models-and-selection`  
Preview: <https://upgradefor-page-generator-o2xwozlgq-bacalimser-8615s-projects.vercel.app/dispatch>  
Commit verified: `c072b43e`

## Scope

This report records the current public preview state for the read-only 3D equipment twin block in `/dispatch`.
It verifies asset serving and the visible equipment-card selection semantics only. It does not claim production BMS/SCADA
control, live telemetry, or real command execution.

## Asset Serving Evidence

All checks were run with cache-busting query params against the preview deployment.

| Asset | Status | Content type | Bytes |
| --- | ---: | --- | ---: |
| `/dispatch` | 200 | `text/html; charset=utf-8` | 100992 |
| `/models/equipment/supply-vent-unit-01-assembled.glb` | 200 | `model/gltf-binary` | 1774088 |
| `/models/equipment/supply-vent-unit-01-exploded.glb` | 200 | `model/gltf-binary` | 2933776 |
| `/models/dispatch/chiller.glb` | 200 | `model/gltf-binary` | 1122372 |
| `/models/dispatch/fancoil-fc92.glb` | 200 | `model/gltf-binary` | 3487744 |
| `/models/dispatch/cooling-tower-small.glb` | 200 | `model/gltf-binary` | 331064 |
| `/models/dispatch/multi-split-system.glb` | 200 | `model/gltf-binary` | 307264 |

The local registry guard also passed:

```text
node scripts/asset-qa/verify-dispatch-equipment-models.mjs
checked: 6
```

Reusable deployed smoke command for this branch:

```text
DISPATCH_BASE_URL=https://upgradefor-page-generator-d4wrhir94-bacalimser-8615s-projects.vercel.app node scripts/asset-qa/verify-dispatch-preview.mjs
```

## Browser Evidence

Browser automation opened the preview `/dispatch` page and captured:

- page title: `UPGRADE Dispatch / Asia Park Astana`
- `canvasCount=2`
- `hasFallback=false`
- initial active equipment card: `ahu-pv1`
- initial active card has `data-selection-state="active"` and `aria-current="true"`
- active card label: `Выбрано`

Screenshot artifact:

```text
/Users/m1/UPGRADE/upgradefor-page-generator/runtime/dispatch-continuous/screenshots/cycle-006/dispatch-3d-equipment-review.png
```

## Equipment State Notes

- PV-1 uses the real assembled GLB by default and has an exploded GLB available.
- Chiller, fan coil, cooling tower, and multi-split GLBs are served from the preview deployment.
- Exploded view remains gated for models where quality is not ready, using the existing read-only copy.
- Equipment-card state is now machine-verifiable through `data-selection-state`:
  - `active` = `Выбрано`
  - `related` = `Связано`
  - `idle` = not selected and not related

## Safety Copy

The current preview remains a read-only demo layer over existing BMS/SCADA. It must not be presented as production
equipment control. The accepted phrasing remains:

- `Read-only / control locked`
- `DEMO MODE`
- simulated/demo actions only
- no real equipment control

## Remaining QA Drift

This PR branch still predates some later QA infrastructure:

- `scripts/dispatch-smoke-test.mjs` is missing on this branch.
- `test:dispatch` is missing on this branch.
- `test:layout` still expects the old `components/layout/LayoutShell.tsx`.
- TypeScript still reports known legacy non-dispatch errors in account, selector, beauty grid, and manufacturers files.
