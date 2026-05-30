# Dispatch PV-1 Equipment Twin Viewer Fit — Cycle 021

Date: 2026-05-30  
Mode: DESIGN  
Scope: targeted lower PV-1 equipment twin viewer fit/crop fix for PR #292.

## Summary

The lower `3D equipment twins` block was using the generic equipment viewer camera/bounds profile. That worked for compact equipment, but the long PV-1 GLB was rendered as an over-zoomed wall/corner instead of a readable assembled unit.

Cycle 021 keeps the approved PV-1 GLB unchanged and updates only the lower viewer camera/fit behavior:

- PV-1 now uses a dedicated lower-viewer profile aligned with the accepted top PV-1 viewer camera.
- `OrbitControls` is registered with `makeDefault`, so `Bounds` can correctly coordinate camera/controls.
- Non-PV-1 equipment keeps the existing generic profile.
- No source model, backend, package, auth, DB, WebSocket, or real control behavior changed.

## Screenshots

| State | Screenshot |
| --- | --- |
| Lower PV-1 desktop after fit fix | `docs/dispatch/reports/screenshots/cycle-021/lower-pv1-fit-desktop.png` |
| Lower PV-1 mobile/narrow evidence | `docs/dispatch/reports/screenshots/cycle-021/lower-pv1-fit-mobile.png` |

## Evidence

Local browser evidence for the lower PV-1 viewer:

- `active`: `ahu-pv1`
- `heading`: `Приточная вентустановка ПВ-1`
- `canvas`: `1`
- `fallback`: `false`
- desktop document width: no global horizontal overflow
- mobile document width: no global horizontal overflow

The mobile screenshot still shows the bottom navigation as horizontally scrollable. That is a separate mobile navigation UX issue and was not mixed into this PV-1 viewer-fit cycle.

## QA

Passed:

- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs`
- `node --check scripts/asset-qa/verify-dispatch-equipment-models.mjs`
- `npm run test:layout`
- `DISPATCH_BASE_URL=http://127.0.0.1:3055 node scripts/asset-qa/verify-dispatch-preview-suite.mjs`
- `node scripts/asset-qa/verify-dispatch-equipment-models.mjs`
- `node node_modules/next/dist/bin/next build`
- `git diff --check`

Not available on this PR branch:

- `npm run typecheck`
- `npm run test:dispatch`
- `npm run test:ci`
- `scripts/dispatch-smoke-test.mjs`

## Read-Only Safety

The page remains a demo/read-only digital twin layer over existing BMS/SCADA. No real equipment control is added or implied.

## Decision

PV-1 lower equipment twin fit: `FIXED_FOR_PR_REVIEW`.

Remaining follow-up: evaluate bottom navigation/mobile horizontal scroll as a separate `MODE=DESIGN` or `MODE=QA` cycle.
