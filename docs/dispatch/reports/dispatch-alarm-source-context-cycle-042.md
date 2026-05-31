# DISPATCH-CONTINUOUS cycle 042

Mode: INTERACTIVE

Micro-goal: make alarm clicks carry visible source context into the equipment passport, SCADA tags and related trend selection.

## What changed

- Added `sourceTagId` and `trendKey` to dispatch alarm events.
- Added local `selectedAlarmId` state in the dispatch dashboard.
- Clicking an alarm now:
  - opens the linked equipment passport;
  - switches the passport to `SCADA-теги`;
  - shows a selected alarm context card;
  - highlights the exact source SCADA tag row;
  - switches the trend selector to the alarm-related metric.
- Updated smoke coverage for the alarm → passport → SCADA tag → trend chain.

## Safety

- No backend, DB, WebSocket, auth or real equipment commands were added.
- The page remains a read-only demo layer over existing BMS/SCADA.
- Existing `No real equipment control` copy remains visible.

## Local QA

- `node --check scripts/asset-qa/verify-dispatch-action-flows.mjs` passed.
- `npm run test:layout` passed.
- `DISPATCH_ACTION_FLOW_OUTPUT_DIR=docs/dispatch/reports/screenshots/cycle-042/action-flow DISPATCH_BASE_URL=http://127.0.0.1:3075 node scripts/asset-qa/verify-dispatch-action-flows.mjs` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3075 node scripts/asset-qa/verify-dispatch-action-states.mjs` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3075 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3075 node scripts/asset-qa/capture-dispatch-fullpage-review.mjs http://127.0.0.1:3075 docs/dispatch/reports/screenshots/cycle-042` passed.
- `node node_modules/next/dist/bin/next build` passed.
- `git diff --check` passed.

## TypeScript

`npx tsc --noEmit --pretty false` still fails only on known non-dispatch legacy groups in this branch:

- account searchParams nullability;
- selector Prisma JSON/log typing;
- beauty grids `never` inference;
- copper-aluminum manufacturers nullability/type predicate issues.

No new dispatch TypeScript error was reported.

## Screenshots

- Alarm source context: `docs/dispatch/reports/screenshots/cycle-042/action-flow/action-00a-alarm-source-context.png`
- Full page: `docs/dispatch/reports/screenshots/cycle-042/00-full-page.png`
- Mobile full page: `docs/dispatch/reports/screenshots/cycle-042/99-mobile-full-page.png`
- Full-page section set: `docs/dispatch/reports/screenshots/cycle-042/section-01-overview.png` through `section-12-ai.png`

## Result

The alarm click path is now visibly connected: alarm → equipment passport → selected source tag → related trend metric, while staying read-only and simulated.
