# DISPATCH-CONTINUOUS / cycle 031

Mode: DESIGN

Micro-goal: fix local text and spacing tight spots from the cycle 030 full-page audit without changing dispatch architecture.

## View Links

- Local review target: <http://127.0.0.1:3064/dispatch>
- Vercel preview `/dispatch`: <https://upgradefor-page-generator-git-204210-bacalimser-8615s-projects.vercel.app/dispatch>
- Vercel deployment URL: <https://upgradefor-page-generator-h5xivremt-bacalimser-8615s-projects.vercel.app>

## What Changed

- KPI cards now use adaptive columns instead of three cramped columns.
- `DATA_ERROR` and other KPI values can wrap safely without overflowing the card.
- Trend metric buttons now use a 2x2 layout with multi-line labels and units.
- Passport tabs now use a 3+2 layout on desktop and 2-column layout on mobile, with wrapped labels.
- Header status chips can wrap, and the mobile header stacks cleanly.
- Bottom navigation now has an explicit horizontal scroll behavior and wrapped button labels.
- Section metric values can wrap on narrow widths.

## Full-Page Review Evidence

- Full page: `docs/dispatch/reports/screenshots/cycle-031/00-full-page.png`
- Mobile full page: `docs/dispatch/reports/screenshots/cycle-031/99-mobile-full-page.png`
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

## QA Findings

- Full-page screenshots captured: 14.
- External preview full-page screenshots captured: 14.
- Dispatch sections clicked and verified active: 12/12.
- Desktop global horizontal overflow: false.
- Mobile global horizontal overflow: false.
- Previously targeted tight spots no longer appear in top audit samples:
  - telemetry KPI / `DATA_ERROR`;
  - trend metric buttons;
  - passport tabs;
  - mobile header/status chips.
- Remaining local samples are mostly the digital-twin stage/node map and the intentionally scrollable bottom nav.

## Commands

- `DISPATCH_BASE_URL=http://127.0.0.1:3064 node scripts/asset-qa/capture-dispatch-fullpage-review.mjs ...` — passed
- `node --check scripts/asset-qa/capture-dispatch-fullpage-review.mjs` — passed
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `npm run test:layout` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3064 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `node scripts/asset-qa/verify-dispatch-equipment-models.mjs` — passed
- `npm run build` — passed
- `npx tsc --noEmit --pretty false 2>&1 | rg 'dispatch|Dispatch' || true` — no dispatch TypeScript output after build
- `git diff --check` — passed
- `curl -s -o /dev/null -w '%{http_code}' https://upgradefor-page-generator-git-204210-bacalimser-8615s-projects.vercel.app/dispatch?cb=cycle031` — 200
- `DISPATCH_BASE_URL=https://upgradefor-page-generator-git-204210-bacalimser-8615s-projects.vercel.app node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `DISPATCH_BASE_URL=https://upgradefor-page-generator-git-204210-bacalimser-8615s-projects.vercel.app node scripts/asset-qa/capture-dispatch-fullpage-review.mjs ...` — passed

## Preview Result

- Vercel deployment state: READY.
- Preview smoke: passed, 9/9 checks.
- Preview full-page review: passed, 12/12 sections captured plus mobile.
- Preview screenshots: `/Users/m1/UPGRADE/upgradefor-page-generator/runtime/dispatch-continuous/screenshots/cycle-031-preview/`.
- Remaining known UI candidates: local twin node label overflow samples and intentionally scrollable bottom navigation.

## Next Recommended Cycle

Mode: QA

Micro-goal: button/action audit for all primary section actions, passport drawer actions, read-only modal, demo ticket modal, trend buttons, and AI insight buttons.
