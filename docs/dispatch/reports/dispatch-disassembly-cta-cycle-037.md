# Dispatch Continuous Cycle 037

## Mode

DESIGN

## Micro-goal

Reduce duplicated primary `Разобрать установку` CTA in the PV-1 3D passport without changing GLB assets, real equipment behavior, or read-only/demo safety.

## View Links

- Local QA URL: http://127.0.0.1:3070/dispatch
- Preview URL: https://upgradefor-page-generator-nmhhdendi-bacalimser-8615s-projects.vercel.app/dispatch
- Stable branch preview URL: https://upgradefor-page-generator-git-204210-bacalimser-8615s-projects.vercel.app/dispatch

## What Changed

- Kept the main selected-equipment disassembly action in the 3D viewer header.
- Replaced the duplicate passport-side primary button with a quieter contextual 3D action:
  - assembled state: `Показать разборку в 3D`
  - exploded state: `Вернуть собранный вид`
- Preserved local-only toggle behavior and explicit safety copy: `No real equipment control`.
- Added smoke coverage to fail if more than one visible primary `Разобрать установку` / `Собрать установку` CTA appears.

## Screenshots

- Full page: `docs/dispatch/reports/screenshots/cycle-037/00-full-page.png`
- Overview: `docs/dispatch/reports/screenshots/cycle-037/section-01-overview.png`
- Cooling: `docs/dispatch/reports/screenshots/cycle-037/section-02-cooling.png`
- Fan coils: `docs/dispatch/reports/screenshots/cycle-037/section-03-fan-coils.png`
- Ventilation: `docs/dispatch/reports/screenshots/cycle-037/section-04-ventilation.png`
- ITP: `docs/dispatch/reports/screenshots/cycle-037/section-05-itp.png`
- Pumps: `docs/dispatch/reports/screenshots/cycle-037/section-06-pumps.png`
- Heat exchangers: `docs/dispatch/reports/screenshots/cycle-037/section-07-heat-exchangers.png`
- Alarms: `docs/dispatch/reports/screenshots/cycle-037/section-08-alarms.png`
- Trends: `docs/dispatch/reports/screenshots/cycle-037/section-09-trends.png`
- Equipment passports: `docs/dispatch/reports/screenshots/cycle-037/section-10-equipment.png`
- Tickets: `docs/dispatch/reports/screenshots/cycle-037/section-11-tickets.png`
- AI diagnostics: `docs/dispatch/reports/screenshots/cycle-037/section-12-ai.png`
- Mobile 390px: `docs/dispatch/reports/screenshots/cycle-037/99-mobile-full-page.png`
- Full-page audit JSON: `docs/dispatch/reports/screenshots/cycle-037/fullpage-review-report.json`

## QA

- `node --check scripts/asset-qa/verify-dispatch-action-states.mjs` — passed
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `node --check scripts/asset-qa/capture-dispatch-fullpage-review.mjs` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3070 node scripts/asset-qa/verify-dispatch-action-states.mjs` — passed, `primaryDisassemblyCtas: 1`
- `DISPATCH_BASE_URL=http://127.0.0.1:3070 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed, 11/11 checks
- `DISPATCH_BASE_URL=http://127.0.0.1:3070 node scripts/asset-qa/capture-dispatch-fullpage-review.mjs http://127.0.0.1:3070 docs/dispatch/reports/screenshots/cycle-037` — passed, 12/12 section screenshots
- `node scripts/asset-qa/verify-dispatch-equipment-models.mjs` — passed, 6/6 model paths exist
- `npm run test:layout` — passed
- `npm run build` — passed
- `npx tsc --noEmit --pretty false` — failed only on known non-dispatch legacy TypeScript groups
- `git diff --check` — passed
- `curl https://upgradefor-page-generator-nmhhdendi-bacalimser-8615s-projects.vercel.app/dispatch` — passed, HTTP 200
- `DISPATCH_BASE_URL=https://upgradefor-page-generator-nmhhdendi-bacalimser-8615s-projects.vercel.app node scripts/asset-qa/verify-dispatch-action-states.mjs` — passed, `primaryDisassemblyCtas: 1`
- `DISPATCH_BASE_URL=https://upgradefor-page-generator-nmhhdendi-bacalimser-8615s-projects.vercel.app node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed, 11/11 checks
- `DISPATCH_BASE_URL=https://upgradefor-page-generator-nmhhdendi-bacalimser-8615s-projects.vercel.app node scripts/asset-qa/capture-dispatch-fullpage-review.mjs https://upgradefor-page-generator-nmhhdendi-bacalimser-8615s-projects.vercel.app /Users/m1/UPGRADE/upgradefor-page-generator/runtime/dispatch-continuous/screenshots/cycle-037-preview` — passed, 12/12 section screenshots

## Full-Page Review Notes

- Desktop page-level horizontal overflow: none.
- Mobile 390px page-level horizontal overflow: none.
- Sticky bottom navigation intentionally uses internal horizontal scroll; audit records internal scroll width but document width remains stable.
- No dialogs were open during section sweep.
- Safety copy remained visible: Read-only, Demo Mode, No real equipment control.
- External preview full-page screenshots were captured to `/Users/m1/UPGRADE/upgradefor-page-generator/runtime/dispatch-continuous/screenshots/cycle-037-preview`.

## Model Decisions

- PV-1: unchanged; real GLB paths preserved.
- Chiller: unchanged; temporary assembled-only state preserved.
- Fancoil: unchanged.
- Cooling Tower: unchanged.
- Multi Split: unchanged.

## Next Cycle

Recommended next micro-goal: `MODE=DESIGN` or `MODE=QA` to polish sticky bottom navigation readability and button wrapping across desktop/tablet/mobile, because the full-page audit shows the nav has large internal horizontal scroll even though it does not break page width.
