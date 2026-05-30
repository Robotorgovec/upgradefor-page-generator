# DISPATCH-CONTINUOUS / cycle 032

Mode: QA

Micro-goal: add a repeatable action-flow audit for dispatch section actions, passport drawer actions, trend controls, AI actions, demo ticket modal, and read-only audit behavior.

## View Links

- Local review target used for QA: <http://127.0.0.1:3065/dispatch>
- Preview URL: pending Git/Vercel branch deployment for this commit

## What Changed

- Added `scripts/asset-qa/verify-dispatch-action-flows.mjs`.
- Added stable `data-testid` selectors for section actions, drawer actions, AI submit/answer, and demo modal controls.
- Added `action-flows` to `scripts/asset-qa/verify-dispatch-preview-suite.mjs`.
- The action verifier now checks that:
  - `Open passport` opens/preserves the equipment registry drawer;
  - `Create demo ticket` opens a demo/read-only ticket modal and states that nothing is sent externally;
  - `Show trends` switches to the Trends section and keeps equipment context;
  - trend period and metric buttons update visible active state;
  - `AI diagnostics`, AI submit, and AI insight clicks produce contextual demo state;
  - passport tabs switch correctly;
  - drawer ticket/trends/AI/read-only actions are not silent;
  - read-only controls write a safe local audit entry with `No real equipment control`.

## Full-Page Review Evidence

- Full page: `docs/dispatch/reports/screenshots/cycle-032/00-full-page.png`
- Mobile full page: `docs/dispatch/reports/screenshots/cycle-032/99-mobile-full-page.png`
- Section screenshots:
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

## Action-Flow Screenshots

- Demo ticket modal: `docs/dispatch/reports/screenshots/cycle-032/action-flow/action-01-ticket-modal.png`
- Trends context: `docs/dispatch/reports/screenshots/cycle-032/action-flow/action-02-trends-context.png`
- Pressure trend, 7 days: `docs/dispatch/reports/screenshots/cycle-032/action-flow/action-03-trend-pressure-7d.png`
- AI diagnostics: `docs/dispatch/reports/screenshots/cycle-032/action-flow/action-04-ai-diagnostics.png`
- AI submit: `docs/dispatch/reports/screenshots/cycle-032/action-flow/action-05-ai-submit.png`
- Read-only modal: `docs/dispatch/reports/screenshots/cycle-032/action-flow/action-06-readonly-modal.png`
- Read-only audit: `docs/dispatch/reports/screenshots/cycle-032/action-flow/action-07-readonly-audit.png`

## QA Findings

- Full-page screenshots captured: 14.
- Action-flow screenshots captured: 7.
- Dispatch sections clicked and verified active: 12/12.
- Desktop global horizontal overflow: false.
- Mobile global horizontal overflow: false.
- Action-flow verifier passed locally.
- Preview suite now includes 10 checks after adding `action-flows`.
- Remaining local samples are still mostly the digital-twin stage/node map and intentionally scrollable bottom navigation.

## Commands

- `node --check scripts/asset-qa/verify-dispatch-action-flows.mjs` — passed
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3065 node scripts/asset-qa/verify-dispatch-action-flows.mjs` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3065 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed, 10/10 checks
- `DISPATCH_BASE_URL=http://127.0.0.1:3065 node scripts/asset-qa/capture-dispatch-fullpage-review.mjs ...` — passed
- `DISPATCH_ACTION_FLOW_OUTPUT_DIR=docs/dispatch/reports/screenshots/cycle-032/action-flow DISPATCH_BASE_URL=http://127.0.0.1:3065 node scripts/asset-qa/verify-dispatch-action-flows.mjs` — passed
- `npm run test:layout` — passed
- `node scripts/asset-qa/verify-dispatch-equipment-models.mjs` — passed
- `npm run build` — passed
- `npx tsc --noEmit --pretty false 2>&1 | rg 'dispatch|Dispatch' || true` — no dispatch TypeScript output after build
- `git diff --check` — passed

## Next Recommended Cycle

Mode: DESIGN

Micro-goal: reduce the remaining local overflow samples in the digital-twin node map without changing equipment behavior or model assets.
