# DISPATCH-CONTINUOUS cycle 045

Mode: DESIGN

Micro-goal: improve trend readability with compact operational summary cards and a current-value marker.

## What changed

- Added a trend summary row with `Текущее`, `Среднее`, `Диапазон`, and `Data health`.
- Added a dashed current-value marker on the selected trend chart.
- `DATA_ERROR` points remain excluded from calculations and are surfaced in the `Data health` card.
- Extended the action-flow smoke test so the `Давление / 7 дней` path verifies `6/7 valid`, `DATA_ERROR excluded`, and a readable current value.

## Why this helps

Operators can now understand the selected metric without parsing the chart visually: current value, average, min/max, and data-quality coverage are visible next to the graph. This directly supports the roadmap item for readable trend graphs and DATA_ERROR quarantine.

## Local screenshots

- Full page: `docs/dispatch/reports/screenshots/cycle-045/00-full-page.png`
- Trend pressure state: `docs/dispatch/reports/screenshots/cycle-045/action-flow/action-03-trend-pressure-7d.png`
- Mobile full page: `docs/dispatch/reports/screenshots/cycle-045/99-mobile-full-page.png`
- Full-page review report: `docs/dispatch/reports/screenshots/cycle-045/fullpage-review-report.json`

## Local QA

- `node --check scripts/asset-qa/verify-dispatch-action-flows.mjs` passed.
- `npm run test:layout` passed.
- `DISPATCH_ACTION_FLOW_OUTPUT_DIR=docs/dispatch/reports/screenshots/cycle-045/action-flow DISPATCH_BASE_URL=http://127.0.0.1:3077 node scripts/asset-qa/verify-dispatch-action-flows.mjs` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3077 node scripts/asset-qa/capture-dispatch-fullpage-review.mjs http://127.0.0.1:3077 docs/dispatch/reports/screenshots/cycle-045` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3077 node scripts/asset-qa/verify-dispatch-action-states.mjs` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3077 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` passed, 11/11.
- `node node_modules/next/dist/bin/next build` passed.
- `git diff --check` passed.

## TypeScript note

There is no `typecheck` npm script on this branch. Direct `npx tsc --noEmit --pretty false` still reports known non-dispatch legacy errors in account, selector, beauty grid, and copper/aluminum manufacturer areas; no new dispatch TypeScript errors were introduced by this cycle.

## Safety

This cycle did not add backend, DB, WebSocket, auth, or real equipment control. UPGRADE Dispatch remains a read-only/demo layer over existing BMS/SCADA.
