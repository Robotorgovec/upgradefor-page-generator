# DISPATCH-CONTINUOUS / cycle 024

Mode: CONTENT

Micro-goal: mark physically impossible DP telemetry as `DATA_ERROR`.

## Result

- Differential pressure values outside the 0–16 bar range are normalized as `DATA_ERROR`.
- The pressure trend excludes invalid points from min/max scaling instead of plotting them as real pressure.
- Invalid pressure points are shown as red anomaly markers with `DATA_ERROR` messaging.
- Live telemetry, alarm/event cards, selected module metrics, and passport parameters now show data-quality state instead of impossible pressure.
- The alarm flow still opens the related pump/pressure context and keeps commands read-only.

## Preview

Preview deploy was not created for this commit. Vercel Preview deploy blocked by project daily limit: api-deployments-free-per-day. Retry after the quota resets.

Local production view for review: http://127.0.0.1:3060/dispatch

## Screenshots

- `docs/dispatch/reports/screenshots/cycle-024/01-data-error-overview.png`
- `docs/dispatch/reports/screenshots/cycle-024/02-data-error-pressure-trend.png`
- `docs/dispatch/reports/screenshots/cycle-024/03-data-error-passport-params.png`
- `docs/dispatch/reports/screenshots/cycle-024/04-mobile-data-error.png`

## QA

- `node --check scripts/asset-qa/verify-dispatch-data-quality.mjs` — passed
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `npm run test:layout` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3060 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `node scripts/asset-qa/verify-dispatch-equipment-models.mjs` — passed
- `node node_modules/next/dist/bin/next build` — passed
- `git diff --check` — passed
- `npx tsc --noEmit --pretty false` — known legacy non-dispatch errors remain on this PR branch.

## Safety

This remains a demo/read-only digital twin layer over existing BMS/SCADA. The data-quality state prevents an impossible raw tag from being interpreted as valid operational telemetry.

## Next Recommended Micro-goal

MODE=CONTENT: alarm severity/SLA presentation or equipment passport KPI top row.


## Deployment

- Preview status: blocked by Vercel daily deployment quota.
- Blocker: `Vercel Preview deploy blocked by project daily limit: api-deployments-free-per-day. Retry after the quota resets.`
- Local production view: `http://127.0.0.1:3060/dispatch`
- External smoke command after quota reset: `DISPATCH_BASE_URL=https://<new-preview-url> node scripts/asset-qa/verify-dispatch-preview-suite.mjs`
