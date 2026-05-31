# DISPATCH-CONTINUOUS cycle 047

Mode: QA/DESIGN

Micro-goal: make passport document actions visibly explicit instead of silently looking like generic buttons.

## What changed

- Added action metadata for passport document buttons: `Demo ticket`, `Trends`, and `Read-only locked`.
- Added explicit `data-action-state`, `title`, and `aria-label` values for document buttons.
- Updated document buttons to use a stable two-column layout with readable type chips and status chips on mobile.
- Extended `verify-dispatch-action-states.mjs` to open the passport `Документы` tab, verify every document button has an explicit action state and visible status, and click a read-only document to confirm the safe modal path.

## Why this helps

Operators can now see whether a passport document action opens a demo ticket, opens trends, or is locked/read-only before clicking. This reduces silent-click ambiguity while preserving the read-only/demo layer over existing BMS/SCADA.

## Local screenshots

- Full page: `docs/dispatch/reports/screenshots/cycle-047/00-full-page.png`
- Passport document action states, mobile: `docs/dispatch/reports/screenshots/cycle-047/passport-documents-actions-mobile.png`
- Read-only modal action-flow: `docs/dispatch/reports/screenshots/cycle-047/action-flow/action-06-readonly-modal.png`
- Mobile full page: `docs/dispatch/reports/screenshots/cycle-047/99-mobile-full-page.png`
- Full-page review report: `docs/dispatch/reports/screenshots/cycle-047/fullpage-review-report.json`

## Local QA

- `node --check scripts/asset-qa/verify-dispatch-action-states.mjs` passed.
- `node --check scripts/asset-qa/verify-dispatch-action-flows.mjs` passed.
- `node --check scripts/asset-qa/capture-dispatch-fullpage-review.mjs` passed.
- `npm run test:layout` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3079 node scripts/asset-qa/verify-dispatch-action-states.mjs` passed.
- `DISPATCH_ACTION_FLOW_OUTPUT_DIR=docs/dispatch/reports/screenshots/cycle-047/action-flow DISPATCH_BASE_URL=http://127.0.0.1:3079 node scripts/asset-qa/verify-dispatch-action-flows.mjs` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3079 node scripts/asset-qa/capture-dispatch-fullpage-review.mjs http://127.0.0.1:3079 docs/dispatch/reports/screenshots/cycle-047` passed.
- `DISPATCH_BASE_URL=http://127.0.0.1:3079 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` passed, 11/11.
- `node node_modules/next/dist/bin/next build` passed.
- `npm run build` passed.
- `git diff --check` passed.

## TypeScript note

There is no `typecheck` npm script on this branch. Direct `npx tsc --noEmit --pretty false` still reports known non-dispatch legacy errors in account, selector, beauty grid, and copper/aluminum manufacturer areas; no new dispatch TypeScript errors were introduced by this cycle.

## Script note

There is no `test:dispatch` or `test:ci` npm script on this branch. The equivalent dispatch suite was run directly through `scripts/asset-qa/verify-dispatch-preview-suite.mjs`.

## Safety

This cycle did not add backend, DB, WebSocket, auth, or real equipment control. UPGRADE Dispatch remains a read-only/demo layer over existing BMS/SCADA.
