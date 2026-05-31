# Dispatch 3D Equipment Final QA

Date: 2026-05-30  
Branch: `fix/dispatch-3d-equipment-models-and-selection`  
PR: <https://github.com/Robotorgovec/upgradefor-page-generator/pull/292>  
Preview checked: <https://upgradefor-page-generator-laupnxw2q-bacalimser-8615s-projects.vercel.app/dispatch>

## Scope

This is a final browser QA pass across the current `/dispatch` 3D equipment twins. It verifies the demo/read-only
equipment layer only. It does not replace source models, does not add backend/DB/WebSocket/auth, and does not enable real
BMS/SCADA equipment commands.

## Screenshots

| State | Screenshot |
| --- | --- |
| Top PV-1 | `docs/dispatch/reports/screenshots/cycle-020/01-top-pv1-desktop.png` |
| Lower PV-1 selected | `docs/dispatch/reports/screenshots/cycle-020/02-lower-pv1-selected.png` |
| Chiller selected | `docs/dispatch/reports/screenshots/cycle-020/03-chiller-selected.png` |
| Fan coil selected | `docs/dispatch/reports/screenshots/cycle-020/03-fancoil-fc92-selected.png` |
| Cooling tower selected | `docs/dispatch/reports/screenshots/cycle-020/03-cooling-tower-small-selected.png` |
| Multi split selected | `docs/dispatch/reports/screenshots/cycle-020/03-multi-split-system-selected.png` |
| Cooling active/related state | `docs/dispatch/reports/screenshots/cycle-020/04-cooling-active-related.png` |
| Conditioning active/related state | `docs/dispatch/reports/screenshots/cycle-020/05-conditioning-active-related.png` |
| Fan coil passport | `docs/dispatch/reports/screenshots/cycle-020/06-fancoil-passport.png` |
| Narrow/mobile observation | `docs/dispatch/reports/screenshots/cycle-020/07-narrow-mobile.png` |

## Equipment Decisions

| Equipment | Evidence | Decision |
| --- | --- | --- |
| Top PV-1 | `dispatch-primary-pv1-viewer` has `canvas=1`, no fallback, title `3D digital twin — Приточная вентустановка ПВ-1`. | Works as real GLB; not changed in this PR cycle. |
| Lower PV-1 | `activeTwin=ahu-pv1`, heading `Приточная вентустановка ПВ-1`, `canvasCount=1`, `fallback=false`. | Real GLB, not cube/placeholder. Needs separate camera-fit review because the clean lower viewer is visually zoomed/cropped. |
| Chiller CH-1 | `activeTwin=chiller`, heading `Чиллер CH-1`, `fallback=false`, `explodedGate=true`. | Temporary assembled-only asset. Do not polish in this PR. Keep exploded gated. |
| Fan coil FC-92 | `activeTwin=fancoil-fc92`, heading `Фанкойл FC-92`, `fallback=false`, passport title `Фанкойл FC-92`. | Real GLB visible; accepted for PR demo with material caveat. Visual is muted/gray, but not a fallback. Approved Drive source exists at `Фанкойлы 04.03.2023/Fancoil FC 92 I01/Fancoil FC 92 I01.blend`. |
| Cooling tower CT-1 | `activeTwin=cooling-tower-small`, heading `Градирня CT-1`, `fallback=false`, `explodedGate=true`. | ACCEPTED_FOR_DEMO_WITH_CAVEATS from the focused CT-1 review. |
| Multi split MS-1 | `activeTwin=multi-split-system`, heading `Мультисплит система MS-1`, `fallback=false`, `explodedGate=true`. | ACCEPTED_FOR_DEMO_WITH_CAVEATS from the approved Drive source review. |

## Active / Related Selection

Cooling section:

```text
activeTwin=chiller
relatedTwins=cooling-tower-small
chiller state=active, selected=true
cooling-tower-small state=related, related=true
```

Conditioning section:

```text
activeTwin=fancoil-fc92
relatedTwins=multi-split-system
fancoil-fc92 state=active, selected=true
multi-split-system state=related, related=true
```

Direct card clicks:

```text
Each direct card click produced exactly one active card.
relatedTwins=""
clicked card aria-current=true
non-selected cards state=idle
```

## Passport

Fan coil passport proof:

```text
passportVisible=true
title=Фанкойл FC-92
tab=Паспорт
readOnly=true
model=Fancoil FC 92 I01 / TO VERIFY
```

## GLB QA

The cycle inspected these GLBs:

```text
public/models/equipment/supply-vent-unit-01-assembled.glb
public/models/dispatch/chiller.glb
public/models/dispatch/cooling-tower-small.glb
public/models/dispatch/fancoil-fc92.glb
public/models/dispatch/multi-split-system.glb
```

Key observations:

- PV-1: real detailed GLB; viewer fit/camera should be reviewed separately.
- Chiller: temporary assembled-only, missing-normal debt already documented.
- Fan coil: no GLB inspector warnings, real source found on Drive, material fidelity needs future pass.
- Cooling tower: accepted with caveats.
- Multi split: accepted with caveats, off-origin warning documented.

## Narrow Viewport Note

At `375px`:

```text
innerWidth=375
document.scrollWidth=360
body.scrollWidth=360
horizontalOverflow=false
```

Document-level horizontal overflow was not reproduced, but nested containers still reported overflow:

```text
dispatchPageStack scrollWidth=502 clientWidth=360
dispatchShell scrollWidth=502 clientWidth=360
dispatchGrid scrollWidth=486 clientWidth=328
dispatchHeader scrollWidth=485 clientWidth=326
```

The top PV-1 appears visually cropped/zoomed in the narrow screenshot. This should be handled as a dedicated
`MODE=DESIGN` or `MODE=3D camera-fit` micro-goal before treating PR #292 as fully merge-ready.

## Safety Copy

The checked UI continues to use read-only/demo framing:

- `Read-only`
- `demo mode`
- `control locked`
- BMS/SCADA write-blocked tags

No real equipment command path was added or implied.

## Current Merge Readiness

Status: **CONDITIONAL GO for 3D asset presence, NOT final merge GO**.

Why conditional:

- All five lower equipment twins are present, selectable, and non-fallback.
- Active/related state works.
- Fan coil passport works.
- Read-only safety is preserved.

Why not final merge GO yet:

- Lower PV-1 and narrow PV-1 presentation need a focused camera-fit/crop review.
- Fan coil material fidelity is accepted for demo with caveats, but should not be presented as final manufacturer-grade
  visualization.

## Recommended Next Cycle

`MODE=3D` or `MODE=DESIGN`: fix/verify PV-1 viewer fit on lower equipment twin and narrow viewport without changing the
PV-1 source GLB.
