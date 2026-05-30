# Dispatch Continuous Cycle 038

## Mode

DESIGN

## Micro-goal

Improve sticky bottom navigation readability and overflow behavior for the UPGRADE Dispatch demo without changing 3D assets, simulated command flow, backend, or page architecture.

## View Links

- Local QA URL: http://127.0.0.1:3071/dispatch
- Preview URL: pending Vercel deployment after commit

## What Changed

- Split the sticky bottom navigation into two clear zones:
  - `bottomNavSections` for engineering section buttons.
  - `bottomMeta` for gateway/user/demo-time status.
- Made section buttons wrap inside a stable two-row desktop layout instead of one long horizontal strip.
- Added compact event-count badges to section buttons.
- Reduced page and button overflow risk with explicit bottom padding, button width constraints, line-height, and `overflow-wrap`.
- Preserved all existing section click handlers and read-only/demo safety copy.

## Screenshots

- Full page: `docs/dispatch/reports/screenshots/cycle-038/00-full-page.png`
- Bottom nav desktop: `docs/dispatch/reports/screenshots/cycle-038/bottom-nav-desktop.png`
- Bottom nav mobile: `docs/dispatch/reports/screenshots/cycle-038/bottom-nav-mobile.png`
- Overview: `docs/dispatch/reports/screenshots/cycle-038/section-01-overview.png`
- Cooling: `docs/dispatch/reports/screenshots/cycle-038/section-02-cooling.png`
- Fan coils: `docs/dispatch/reports/screenshots/cycle-038/section-03-fan-coils.png`
- Ventilation: `docs/dispatch/reports/screenshots/cycle-038/section-04-ventilation.png`
- ITP: `docs/dispatch/reports/screenshots/cycle-038/section-05-itp.png`
- Pumps: `docs/dispatch/reports/screenshots/cycle-038/section-06-pumps.png`
- Heat exchangers: `docs/dispatch/reports/screenshots/cycle-038/section-07-heat-exchangers.png`
- Alarms: `docs/dispatch/reports/screenshots/cycle-038/section-08-alarms.png`
- Trends: `docs/dispatch/reports/screenshots/cycle-038/section-09-trends.png`
- Equipment passports: `docs/dispatch/reports/screenshots/cycle-038/section-10-equipment.png`
- Tickets: `docs/dispatch/reports/screenshots/cycle-038/section-11-tickets.png`
- AI diagnostics: `docs/dispatch/reports/screenshots/cycle-038/section-12-ai.png`
- Mobile 390px: `docs/dispatch/reports/screenshots/cycle-038/99-mobile-full-page.png`
- Full-page audit JSON: `docs/dispatch/reports/screenshots/cycle-038/fullpage-review-report.json`

## QA

- `node --check scripts/asset-qa/verify-dispatch-action-states.mjs` — passed
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `node --check scripts/asset-qa/capture-dispatch-fullpage-review.mjs` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3071 node scripts/asset-qa/verify-dispatch-action-states.mjs` — passed, `primaryDisassemblyCtas: 1`
- `DISPATCH_BASE_URL=http://127.0.0.1:3071 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed, 11/11 checks
- `DISPATCH_BASE_URL=http://127.0.0.1:3071 node scripts/asset-qa/capture-dispatch-fullpage-review.mjs http://127.0.0.1:3071 docs/dispatch/reports/screenshots/cycle-038` — passed, 12/12 section screenshots
- `node scripts/asset-qa/verify-dispatch-equipment-models.mjs` — passed, 6/6 model paths exist
- `npm run test:layout` — passed
- `npm run build` — passed
- `npx tsc --noEmit --pretty false` — failed only on known non-dispatch legacy TypeScript groups
- `git diff --check` — passed

## Full-Page Review Notes

- Desktop page-level horizontal overflow: none.
- Mobile 390px page-level horizontal overflow: none.
- Desktop overflow samples: none after final CSS pass.
- Mobile overflow samples: none after final CSS pass.
- All 12 dispatch sections were opened and screenshot-captured.
- Safety copy remained visible: Read-only, Demo Mode, No real equipment control.

## Model Decisions

- PV-1: unchanged; real GLB paths preserved.
- Chiller: unchanged.
- Fancoil: unchanged.
- Cooling Tower: unchanged.
- Multi Split: unchanged.

## Next Cycle

Recommended next micro-goal: `MODE=DESIGN` to continue button/text polish in the passport/action areas, or `MODE=QA` to add a stricter visual overflow assertion for bottom nav labels.

