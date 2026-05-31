# DISPATCH-CONTINUOUS cycle 048

Mode: DESIGN/QA

Micro-goal: replace raw passport `TO VERIFY` values with managed verification badges.

## What changed

- Added managed passport verification rendering for incomplete equipment fields.
- Replaced raw `TO VERIFY` text in the visible passport list with operator-readable values:
  - `Не заполнено`
  - `требует верификации`
  - status badges `Требует обхода` and `Частично не заполнено`
- Added a dedicated smoke script for passport verification badges.
- Added the verification badge check to the full dispatch preview suite.
- Fixed the badge CSS to render as a separate stacked chip on mobile and desktop.

## Why this helps

The passport now reads like an operational register instead of exposing raw placeholder data. Operators can distinguish confirmed values from incomplete fields without losing read-only/demo safety context.

## Local screenshots

- Full page: `docs/dispatch/reports/screenshots/cycle-048/00-full-page.png`
- Passport verification badges, mobile: `docs/dispatch/reports/screenshots/cycle-048/passport-verification-badges-mobile.png`
- Mobile full page: `docs/dispatch/reports/screenshots/cycle-048/99-mobile-full-page.png`
- Full-page review report: `docs/dispatch/reports/screenshots/cycle-048/fullpage-review-report.json`
- Action-flow screenshots: `docs/dispatch/reports/screenshots/cycle-048/action-flow/`

## Local QA

- `node --check scripts/asset-qa/verify-dispatch-passport-verification-badges.mjs` passed.
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` passed.
- `node --check scripts/asset-qa/capture-dispatch-fullpage-review.mjs` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3080 node scripts/asset-qa/verify-dispatch-passport-verification-badges.mjs` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3080 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` passed, 12/12.
- `DISPATCH_BASE_URL=http://127.0.0.1:3080 node scripts/asset-qa/capture-dispatch-fullpage-review.mjs http://127.0.0.1:3080 docs/dispatch/reports/screenshots/cycle-048` passed.
- `npm run test:layout` passed.
- `node node_modules/next/dist/bin/next build` passed.
- `git diff --check` passed.

## TypeScript note

There is no `typecheck` npm script on this branch. Direct `npx tsc --noEmit --pretty false` still reports known non-dispatch legacy errors in account, selector, beauty grid, and copper/aluminum manufacturer areas; this cycle did not introduce new dispatch TypeScript errors.

## Script note

There is no `test:dispatch` or `test:ci` npm script on this branch. The equivalent dispatch suite was run directly through `scripts/asset-qa/verify-dispatch-preview-suite.mjs`.

## Safety

This cycle did not add backend, DB, WebSocket, auth, or real equipment control. UPGRADE Dispatch remains a read-only/demo layer over existing BMS/SCADA.
