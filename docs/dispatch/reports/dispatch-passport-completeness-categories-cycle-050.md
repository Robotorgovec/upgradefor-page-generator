# Dispatch Continuous Cycle 050

Date: 2026-05-31

Mode: QA

Micro-goal: improve Equipment Passport completeness visibility and enforce the new no-internal-vertical-scroll rule for `/dispatch`.

## Result

- Added a passport completeness category breakdown:
  - Identity
  - Location
  - SCADA tags
  - Service
- Kept the existing incomplete-field filter and extended its smoke coverage.
- Removed the internal vertical scrollbar from the sticky bottom navigation.
- Added a regression smoke guard for desktop, tablet, and mobile that fails if a visible internal dispatch element uses:
  - `overflow-y: auto`
  - `overflow-y: scroll`
  - `overflow: auto`
  - `overflow: scroll`
  - `max-height`

The only allowed vertical scroll remains the page/body scroll.

## Screenshots

- Full page: `docs/dispatch/reports/screenshots/cycle-050/00-full-page.png`
- Mobile full page: `docs/dispatch/reports/screenshots/cycle-050/99-mobile-full-page.png`
- Passport completeness mobile detail: `docs/dispatch/reports/screenshots/cycle-050/passport-completeness-categories-mobile.png`
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

- `DISPATCH_BASE_URL=http://127.0.0.1:3090 node scripts/asset-qa/verify-dispatch-passport-completeness.mjs` - passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3090 node scripts/asset-qa/verify-dispatch-no-internal-scroll.mjs` - passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3090 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` - passed, 14/14
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
