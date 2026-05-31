# DISPATCH-CONTINUOUS / cycle 023

Mode: DESIGN

Micro-goal: make read-only equipment controls unambiguous in the `/dispatch` demo.

## Result

- Dispatch control buttons now render as disabled controls with `cursor: not-allowed`.
- Each control exposes the tooltip text `Управление заблокировано (Demo mode)`.
- The dashboard header shows the current role: `Роль: Operator` plus `Read-only / Demo mode`.
- Attempts to use locked controls are captured in a local demo audit line and modal copy.
- Copy remains explicit: no real equipment control is performed.
- Primary PV-1 passport controls use the same read-only tooltip and disabled visual treatment.

## Preview

- URL: `https://upgradefor-page-generator-4dxey57bm-bacalimser-8615s-projects.vercel.app/dispatch`
- Status: Ready
- Canonical `/dispatch`: HTTP 200
- External suite: passed

## Screenshots

- `docs/dispatch/reports/screenshots/cycle-023/01-readonly-controls.png`
- `docs/dispatch/reports/screenshots/cycle-023/02-readonly-modal.png`
- `docs/dispatch/reports/screenshots/cycle-023/03-primary-pv1-readonly.png`
- `docs/dispatch/reports/screenshots/cycle-023/04-mobile-readonly-controls.png`
- `docs/dispatch/reports/screenshots/cycle-023/05-preview-readonly-controls.png`

## QA

- `node --check scripts/asset-qa/verify-dispatch-readonly-controls.mjs` — passed
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `npm run test:layout` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3057 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `node scripts/asset-qa/verify-dispatch-equipment-models.mjs` — passed
- `node node_modules/next/dist/bin/next build` — passed
- `DISPATCH_BASE_URL=https://upgradefor-page-generator-4dxey57bm-bacalimser-8615s-projects.vercel.app node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `git diff --check` — passed
- `npx tsc --noEmit --pretty false` — failed on known legacy non-dispatch groups in account, selector, beauty grids, and copper-aluminum manufacturers.

## Safety

This remains a demo/read-only digital twin layer over existing BMS/SCADA. Locked control interactions are local UI audit events only and do not send BMS/SCADA commands.

## Next Recommended Micro-goal

MODE=CONTENT or QA: DP anomaly `6553.x bar` data-quality validation and DATA_ERROR presentation.
