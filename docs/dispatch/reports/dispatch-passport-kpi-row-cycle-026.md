# DISPATCH-CONTINUOUS / cycle 026

Mode: CONTENT

Micro-goal: add a top KPI row to the equipment passport drawer.

## Result

- Equipment passport now shows a compact KPI row above the datasheet snapshot.
- KPI cards include: temperature, pressure, flow, status, and last alarm.
- The pressure KPI inherits `DATA_ERROR` styling when the selected equipment has invalid DP telemetry.
- The last alarm KPI includes severity and SLA context, e.g. `Critical · DP DATA_ERROR на ШУ-2` and `SLA 18 мин`.
- Missing values fall back to `TO VERIFY` instead of pretending production telemetry exists.
- All controls remain read-only/demo only.

## View

Local production view: http://127.0.0.1:3060/dispatch

Vercel Preview is attempted after commit/push.

## Screenshots

- `docs/dispatch/reports/screenshots/cycle-026/01-passport-kpi-row-default.png`
- `docs/dispatch/reports/screenshots/cycle-026/02-passport-kpi-row-data-error.png`
- `docs/dispatch/reports/screenshots/cycle-026/03-mobile-passport-kpis.png`

## QA

- `node --check scripts/asset-qa/verify-dispatch-passport-kpis.mjs` — passed
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `npm run test:layout` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3060 node scripts/asset-qa/verify-dispatch-passport-kpis.mjs` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3060 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `node scripts/asset-qa/verify-dispatch-equipment-models.mjs` — passed
- `npm run build` — passed
- `git diff --check` — passed
- `npx tsc --noEmit --pretty false` — known legacy non-dispatch errors remain on this PR branch; `rg dispatch` found no dispatch TypeScript errors.

## Safety

This remains a demo/read-only digital twin layer over existing BMS/SCADA. The passport KPI row is a read-only summary and does not send commands.

## Next Recommended Micro-goal

MODE=DESIGN/QA: mobile horizontal overflow / top PV-1 viewer crop audit, or MODE=CONTENT: SCADA tags passport tab enhancement.
