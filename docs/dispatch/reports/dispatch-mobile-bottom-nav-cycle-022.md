# Dispatch Mobile Bottom Navigation — Cycle 022

Date: 2026-05-30  
Mode: DESIGN  
Scope: targeted mobile/narrow viewport bottom navigation fit for `/dispatch`.

## Summary

The page itself did not create document-level horizontal scrolling on mobile, but the fixed bottom navigation still had a very wide internal horizontal scroll strip.

Before the fix at 375px:

- document: `scrollWidth=360`, `clientWidth=360`
- `.dispatchBottomNav`: `scrollWidth=1993`, `clientWidth=360`
- `.dispatchBottomNav`: `overflowX=auto`

Cycle 022 keeps the desktop navigation unchanged and adds a mobile-only layout below `760px`:

- bottom navigation switches from one long flex row to a 3-column grid;
- buttons can wrap text inside their cell;
- horizontal overflow is hidden;
- long meta text and demo time input are hidden on mobile, leaving compact `DEMO MODE` copy visible;
- dispatch shell gets extra bottom padding so the taller mobile nav does not cover content.

## Evidence

After the fix at 375px:

- document: `scrollWidth=360`, `clientWidth=360`
- `.dispatchBottomNav`: `scrollWidth=360`, `clientWidth=360`
- `.dispatchBottomNav`: `overflowX=hidden`
- `.bottomMeta`: visible text is `DEMO MODE`

After the fix at 320px:

- document: `scrollWidth=305`, `clientWidth=305`
- `.dispatchBottomNav`: `scrollWidth=305`, `clientWidth=305`
- `.dispatchBottomNav`: `overflowX=hidden`
- `.bottomMeta`: visible text is `DEMO MODE`

## Screenshots

| State | Screenshot |
| --- | --- |
| Before mobile bottom nav | `docs/dispatch/reports/screenshots/cycle-022/before-mobile-bottom-nav.png` |
| After mobile bottom nav | `docs/dispatch/reports/screenshots/cycle-022/after-mobile-bottom-nav.png` |
| After mobile 320px | `docs/dispatch/reports/screenshots/cycle-022/after-mobile-320-bottom-nav.png` |
| After desktop top | `docs/dispatch/reports/screenshots/cycle-022/after-desktop-top.png` |
| After desktop equipment twin | `docs/dispatch/reports/screenshots/cycle-022/after-desktop-equipment-twin.png` |

## QA

Passed:

- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs`
- `node --check scripts/asset-qa/verify-dispatch-equipment-models.mjs`
- `npm run test:layout`
- `DISPATCH_BASE_URL=http://127.0.0.1:3056 node scripts/asset-qa/verify-dispatch-preview-suite.mjs`
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

Mobile bottom navigation horizontal scroll: `FIXED_FOR_PR_REVIEW`.

Remaining follow-up: top PV-1 mobile camera/crop can still be improved in a separate viewer-fit cycle if needed.
