# Dispatch continuous cycle 036 — action state QA

Date: 2026-05-30
Mode: QA
Micro-goal: prevent silent dispatch controls by adding action-state smoke coverage and fixing the visible silent PV-1 passport chips.

## Result

Cycle 036 fixes a concrete silent-click issue in the top PV-1 passport panel: the buttons `Паспорт`, `Параметры`, `ТО`, `Документы`, `Открыть тренды`, and `Создать заявку` now perform explicit read-only/demo actions and write a visible audit message instead of doing nothing.

The page remains a demo/read-only layer over existing BMS/SCADA. No real equipment commands were added.

## Changed

- Added `data-action-state` taxonomy to PV-1 model actions and read-only controls.
- Added visible read-only action messages for top PV-1 passport chips.
- Added `verify-dispatch-action-states.mjs`, a browser smoke check that inventories visible controls and fails when a control has no action state.
- Added `action-states` to the dispatch preview suite so future preview checks include this regression.

## Local action-state evidence

`verify-dispatch-action-states.mjs` on local dev:

- total visible controls: 112
- explicit action-state controls: 19
- missing action state: 0
- smoke-clicked top PV-1 passport, trends, and ticket chips
- confirmed visible copy includes `No real equipment control`

## Screenshots

Local full-page screenshots:

- `docs/dispatch/reports/screenshots/cycle-036/00-full-page.png`
- `docs/dispatch/reports/screenshots/cycle-036/99-mobile-full-page.png`
- `docs/dispatch/reports/screenshots/cycle-036/section-01-overview.png`
- `docs/dispatch/reports/screenshots/cycle-036/section-02-cooling.png`
- `docs/dispatch/reports/screenshots/cycle-036/section-03-fan-coils.png`
- `docs/dispatch/reports/screenshots/cycle-036/section-04-ventilation.png`
- `docs/dispatch/reports/screenshots/cycle-036/section-05-itp.png`
- `docs/dispatch/reports/screenshots/cycle-036/section-06-pumps.png`
- `docs/dispatch/reports/screenshots/cycle-036/section-07-heat-exchangers.png`
- `docs/dispatch/reports/screenshots/cycle-036/section-08-alarms.png`
- `docs/dispatch/reports/screenshots/cycle-036/section-09-trends.png`
- `docs/dispatch/reports/screenshots/cycle-036/section-10-equipment.png`
- `docs/dispatch/reports/screenshots/cycle-036/section-11-tickets.png`
- `docs/dispatch/reports/screenshots/cycle-036/section-12-ai.png`

Action-state screenshot:

- `docs/dispatch/reports/screenshots/cycle-036-action-states/action-state-pv1-ticket.png`

## Local QA

- `node --check scripts/asset-qa/verify-dispatch-action-states.mjs` — passed
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `node --check scripts/asset-qa/capture-dispatch-fullpage-review.mjs` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3069 node scripts/asset-qa/verify-dispatch-action-states.mjs` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3069 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed, 11/11 checks
- `DISPATCH_BASE_URL=http://127.0.0.1:3069 node scripts/asset-qa/capture-dispatch-fullpage-review.mjs` — passed, 12/12 sections
- `node scripts/asset-qa/verify-dispatch-equipment-models.mjs` — passed, 6 GLB entries found
- `npm run test:layout` — passed
- `npm run build` — passed
- `git diff --check` — passed
- `npx tsc --noEmit --pretty false` — failed only on known legacy non-dispatch groups; no dispatch errors were reported.

## Preview QA

Preview URL: <https://upgradefor-page-generator-pzo2byg0l-bacalimser-8615s-projects.vercel.app/dispatch>

- Vercel status — Ready
- `DISPATCH_BASE_URL=https://upgradefor-page-generator-pzo2byg0l-bacalimser-8615s-projects.vercel.app node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed, 11/11 checks
- `DISPATCH_BASE_URL=https://upgradefor-page-generator-pzo2byg0l-bacalimser-8615s-projects.vercel.app node scripts/asset-qa/capture-dispatch-fullpage-review.mjs` — passed, 12/12 sections
- Browser console error check — passed, no errors reported

## Full-page review

- Desktop full-page: passed.
- Mobile 390px full-page: passed.
- Section screenshots captured: 12/12.
- Desktop horizontal page overflow: false.
- Mobile horizontal page overflow: false.
- Sticky bottom navigation intentionally uses horizontal scrolling; it is not page-level overflow.

## Next recommended micro-goal

MODE=DESIGN: reduce the duplicated primary `Разобрать установку` CTA so only one primary action remains while keeping secondary controls in contextual read-only actions.
