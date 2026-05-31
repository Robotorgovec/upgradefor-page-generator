# DISPATCH-CONTINUOUS cycle 049

Mode: DESIGN/QA

Micro-goal: add passport completeness score and an incomplete-field filter.

## What changed

- Added a visible passport completeness score in the `Паспорт` tab.
- Counted required passport fields and showed the filled/incomplete summary.
- Added a read-only-safe filter button to show only fields that need verification.
- Added explicit `data-action-state`, `aria-label`, and tooltip text to the filter button so it is not a silent click.
- Added a dedicated smoke script for passport completeness and filter behavior.
- Added the new completeness check to the full dispatch preview suite.
- Kept raw `TO VERIFY` hidden in visible passport values; incomplete fields still use managed badges.

## Why this helps

Operators can now quickly see whether a passport is complete enough to trust, then filter directly to missing fields that need a site walkdown, nameplate photo, or SCADA/tag verification.

## Local screenshots

- Full page: `docs/dispatch/reports/screenshots/cycle-049/00-full-page.png`
- Passport completeness, mobile: `docs/dispatch/reports/screenshots/cycle-049/passport-completeness-mobile.png`
- Incomplete-field filter, mobile: `docs/dispatch/reports/screenshots/cycle-049/passport-incomplete-filter-mobile.png`
- Mobile full page: `docs/dispatch/reports/screenshots/cycle-049/99-mobile-full-page.png`
- Full-page review report: `docs/dispatch/reports/screenshots/cycle-049/fullpage-review-report.json`

## Local QA

- `node --check scripts/asset-qa/verify-dispatch-passport-completeness.mjs` passed.
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` passed.
- `node --check scripts/asset-qa/capture-dispatch-fullpage-review.mjs` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3090 node scripts/asset-qa/verify-dispatch-passport-completeness.mjs` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3090 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` passed, 13/13.
- `DISPATCH_BASE_URL=http://127.0.0.1:3090 node scripts/asset-qa/capture-dispatch-fullpage-review.mjs http://127.0.0.1:3090 docs/dispatch/reports/screenshots/cycle-049` passed.
- `npm run test:layout` passed.
- `node node_modules/next/dist/bin/next build` passed.
- `git diff --check` passed.

## TypeScript note

There is no `typecheck` npm script on this branch. Direct `npx tsc --noEmit --pretty false` still reports known non-dispatch legacy errors in account, selector, beauty grid, and copper/aluminum manufacturer areas; this cycle did not introduce new dispatch TypeScript errors.

## Script note

There is no `test:dispatch` or `test:ci` npm script on this branch. The equivalent dispatch suite was run directly through `scripts/asset-qa/verify-dispatch-preview-suite.mjs`.

## Safety

This cycle did not add backend, DB, WebSocket, auth, or real equipment control. UPGRADE Dispatch remains a read-only/demo layer over existing BMS/SCADA.
