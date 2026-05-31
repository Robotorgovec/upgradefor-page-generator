# Dispatch Continuous Cycle 051

Date: 2026-05-31

Mode: DESIGN

Micro-goal: harden the sticky bottom navigation after the no-internal-vertical-scroll rule.

## Result

- The fixed dispatch bottom navigation now exposes its real rendered height through a `ResizeObserver`.
- `.dispatchShell` reserves bottom space with `--dispatch-bottom-nav-height`, so the sticky/fixed navigation does not cover the last page content when labels wrap across desktop, tablet, or mobile.
- The no-internal-scroll smoke guard now also verifies that the reserved page bottom padding is larger than the rendered bottom navigation height.
- The page still uses only the main page/body vertical scroll. No internal vertical scrollbar was added.

## Screenshots

- Full page: `docs/dispatch/reports/screenshots/cycle-051/00-full-page.png`
- Mobile full page: `docs/dispatch/reports/screenshots/cycle-051/99-mobile-full-page.png`
- Section captures:
  - `section-01-overview.png`
  - `section-02-cooling.png`
  - `section-03-fan-coils.png`
  - `section-04-ventilation.png`
  - `section-05-itp.png`
  - `section-06-pumps.png`
  - `section-07-heat-exchangers.png`
  - `section-08-alarms.png`
  - `section-09-trends.png`
  - `section-10-equipment.png`
  - `section-11-tickets.png`
  - `section-12-ai.png`

## QA

- `DISPATCH_BASE_URL=http://127.0.0.1:3091 node scripts/asset-qa/verify-dispatch-no-internal-scroll.mjs` - passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3091 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` - passed, 14/14
- `DISPATCH_BASE_URL=http://127.0.0.1:3091 node scripts/asset-qa/capture-dispatch-fullpage-review.mjs http://127.0.0.1:3091 docs/dispatch/reports/screenshots/cycle-051` - passed
- `npm run test:layout` - passed
- `node node_modules/next/dist/bin/next build` - passed
- `git diff --check` - passed
- `npx tsc --noEmit --pretty false` - failed on known legacy groups outside dispatch:
  - account searchParams nullability
  - selector Prisma JSON/logs
  - beauty grids never inference
  - copper-aluminum manufacturers nullability/type predicates

No TypeScript errors were reported in dispatch files.

## Safety

The Dispatch page remains a read-only demo layer over existing BMS/SCADA. No backend, DB, WebSocket, auth, or real equipment command behavior was added.
