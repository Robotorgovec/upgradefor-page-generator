# Dispatch continuous cycle 035 — action chain QA

Date: 2026-05-30
Mode: QA
Micro-goal: strengthen the verified action chain `digital twin node -> passport -> trends -> demo ticket -> AI diagnostics`.

## Result

Cycle 035 adds a stable smoke target for digital twin node clicks and extends the action-flow smoke so the DP anomaly source can be verified from the node map, not only from section buttons.

The dispatch page remains a demo/read-only upper layer over existing BMS/SCADA. No real equipment commands were added.

## Changed

- Added `data-testid="dispatch-equipment-node-<id>"` to digital twin node buttons.
- Updated `verify-dispatch-action-flows.mjs` to click `pump-shu2`, assert the passport drawer opens, and assert the linked `DATA_ERROR` context is visible.
- Fixed the smoke script to read the right-side passport drawer instead of the top PV-1 passport block.

## Screenshots

Local full-page screenshots:

- `docs/dispatch/reports/screenshots/cycle-035/00-full-page.png`
- `docs/dispatch/reports/screenshots/cycle-035/99-mobile-full-page.png`
- `docs/dispatch/reports/screenshots/cycle-035/section-01-overview.png`
- `docs/dispatch/reports/screenshots/cycle-035/section-02-cooling.png`
- `docs/dispatch/reports/screenshots/cycle-035/section-03-fan-coils.png`
- `docs/dispatch/reports/screenshots/cycle-035/section-04-ventilation.png`
- `docs/dispatch/reports/screenshots/cycle-035/section-05-itp.png`
- `docs/dispatch/reports/screenshots/cycle-035/section-06-pumps.png`
- `docs/dispatch/reports/screenshots/cycle-035/section-07-heat-exchangers.png`
- `docs/dispatch/reports/screenshots/cycle-035/section-08-alarms.png`
- `docs/dispatch/reports/screenshots/cycle-035/section-09-trends.png`
- `docs/dispatch/reports/screenshots/cycle-035/section-10-equipment.png`
- `docs/dispatch/reports/screenshots/cycle-035/section-11-tickets.png`
- `docs/dispatch/reports/screenshots/cycle-035/section-12-ai.png`

Action-flow screenshots:

- `docs/dispatch/reports/screenshots/cycle-035-action-flow/action-00-node-passport.png`
- `docs/dispatch/reports/screenshots/cycle-035-action-flow/action-01-ticket-modal.png`
- `docs/dispatch/reports/screenshots/cycle-035-action-flow/action-02-trends-context.png`
- `docs/dispatch/reports/screenshots/cycle-035-action-flow/action-03-trend-pressure-7d.png`
- `docs/dispatch/reports/screenshots/cycle-035-action-flow/action-04-ai-diagnostics.png`
- `docs/dispatch/reports/screenshots/cycle-035-action-flow/action-05-ai-submit.png`
- `docs/dispatch/reports/screenshots/cycle-035-action-flow/action-06-readonly-modal.png`
- `docs/dispatch/reports/screenshots/cycle-035-action-flow/action-07-readonly-audit.png`

## Local QA

- `node --check scripts/asset-qa/verify-dispatch-action-flows.mjs` — passed
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `node --check scripts/asset-qa/capture-dispatch-fullpage-review.mjs` — passed
- `node scripts/asset-qa/verify-dispatch-equipment-models.mjs` — passed, 6 GLB entries found
- `npm run test:layout` — passed
- `npm run build` — passed
- `git diff --check` — passed
- `npx tsc --noEmit --pretty false` — failed only on legacy non-dispatch groups already outside this cycle scope; no dispatch errors were reported.

## Preview QA

Preview URL: <https://upgradefor-page-generator-6iyao1aea-bacalimser-8615s-projects.vercel.app/dispatch>

- Vercel status — Ready
- `DISPATCH_BASE_URL=https://upgradefor-page-generator-6iyao1aea-bacalimser-8615s-projects.vercel.app node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed, 10/10 checks
- `DISPATCH_ACTION_FLOW_OUTPUT_DIR=runtime/dispatch-continuous/screenshots/cycle-035-preview-action-flow DISPATCH_BASE_URL=https://upgradefor-page-generator-6iyao1aea-bacalimser-8615s-projects.vercel.app node scripts/asset-qa/verify-dispatch-action-flows.mjs` — passed
- `DISPATCH_BASE_URL=https://upgradefor-page-generator-6iyao1aea-bacalimser-8615s-projects.vercel.app node scripts/asset-qa/capture-dispatch-fullpage-review.mjs` — passed, 12/12 sections
- Browser console error check — passed, no errors reported

## Full-page review

- Desktop full-page: passed.
- Mobile 390px full-page: passed.
- Section screenshots captured: 12/12.
- Desktop horizontal page overflow: false.
- Mobile horizontal page overflow: false.
- Sticky bottom navigation intentionally uses horizontal scrolling; it is reported as scrollable content, not page-level overflow.

## Note

Browser smoke scripts must run sequentially. A parallel attempt caused shared browser-session interference, then the same checks passed when re-run one at a time.

## Next recommended micro-goal

MODE=QA or MODE=DESIGN: audit all remaining action buttons into explicit states (`active`, `disabled`, `coming soon`, `read-only locked`, `opens modal`, `navigates`) and add a smoke check that prevents silent clicks.
