# DISPATCH-CONTINUOUS cycle 046

Mode: DESIGN

Micro-goal: improve SCADA tag readability in the equipment passport, especially when the table header is hidden on narrow screens.

## What changed

- Added per-cell labels for every SCADA tag row: `Tag`, `Type`, `Register`, `Scaling`, `Unit`, and `Quality`.
- Kept the compact table header on desktop while making mobile rows self-explanatory.
- Preserved the selected alarm source highlight and `DATA_ERROR` row styling.
- Extended the SCADA tag smoke test to verify mobile labels exist for every row.

## Why this helps

The passport SCADA tab now remains readable after responsive layout switches from table columns to stacked cells. Operators can still understand tag type, register, scaling, unit, and quality without relying on a hidden header.

## Local screenshots

- Full page: `docs/dispatch/reports/screenshots/cycle-046/00-full-page.png`
- Mobile SCADA tags: `docs/dispatch/reports/screenshots/cycle-046/scada-tags-mobile.png`
- Alarm source SCADA context: `docs/dispatch/reports/screenshots/cycle-046/action-flow/action-00a-alarm-source-context.png`
- Mobile full page: `docs/dispatch/reports/screenshots/cycle-046/99-mobile-full-page.png`
- Full-page review report: `docs/dispatch/reports/screenshots/cycle-046/fullpage-review-report.json`

## Local QA

- `node --check scripts/asset-qa/verify-dispatch-passport-scada-tags.mjs` passed.
- `node --check scripts/asset-qa/verify-dispatch-action-flows.mjs` passed.
- `node --check scripts/asset-qa/capture-dispatch-fullpage-review.mjs` passed.
- `npm run test:layout` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3078 node scripts/asset-qa/verify-dispatch-passport-scada-tags.mjs` passed.
- `DISPATCH_ACTION_FLOW_OUTPUT_DIR=docs/dispatch/reports/screenshots/cycle-046/action-flow DISPATCH_BASE_URL=http://127.0.0.1:3078 node scripts/asset-qa/verify-dispatch-action-flows.mjs` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3078 node scripts/asset-qa/capture-dispatch-fullpage-review.mjs http://127.0.0.1:3078 docs/dispatch/reports/screenshots/cycle-046` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3078 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` passed, 11/11.
- `node node_modules/next/dist/bin/next build` passed.
- `npm run build` passed.
- `git diff --check` passed.

## TypeScript note

There is no `typecheck` npm script on this branch. Direct `npx tsc --noEmit --pretty false` still reports known non-dispatch legacy errors in account, selector, beauty grid, and copper/aluminum manufacturer areas; no new dispatch TypeScript errors were introduced by this cycle.

## Script note

There is no `test:dispatch` or `test:ci` npm script on this branch. The equivalent dispatch suite was run directly through `scripts/asset-qa/verify-dispatch-preview-suite.mjs`.

## Safety

This cycle did not add backend, DB, WebSocket, auth, or real equipment control. UPGRADE Dispatch remains a read-only/demo layer over existing BMS/SCADA.
