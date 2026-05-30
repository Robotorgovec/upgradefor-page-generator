# DISPATCH-CONTINUOUS / cycle 028

Mode: CONTENT

Micro-goal: add a dedicated SCADA/I-O tags tab to the equipment passport.

## Result

- Added a separate `SCADA-теги` passport tab.
- Moved tag review out of `Документы` into a structured read-only mapping table.
- Each tag row shows: tag name, signal type, register, scaling, unit, and data quality status.
- DP tags such as `SCADA.CHW.DP_01.PV` are recognized as pressure points and show `0–16 bar`.
- In the DP anomaly context, the affected DP tag row is highlighted as `DATA_ERROR`.
- The tab explicitly states this is read-only SCADA/BMS mapping with no write commands.

## View

Local production view during QA: http://127.0.0.1:3062/dispatch

Vercel Preview: https://upgradefor-page-generator-ehigypank-bacalimser-8615s-projects.vercel.app/dispatch

External smoke command:

```bash
DISPATCH_BASE_URL=https://upgradefor-page-generator-ehigypank-bacalimser-8615s-projects.vercel.app node scripts/asset-qa/verify-dispatch-preview-suite.mjs
```

## Screenshots

- `docs/dispatch/reports/screenshots/cycle-028/01-scada-tags-default.png`
- `docs/dispatch/reports/screenshots/cycle-028/02-scada-tags-data-error.png`
- `docs/dispatch/reports/screenshots/cycle-028/03-mobile-scada-tags.png`

## QA

- `node --check scripts/asset-qa/verify-dispatch-passport-scada-tags.mjs` — passed
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `npm run test:layout` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3062 node scripts/asset-qa/verify-dispatch-passport-scada-tags.mjs` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3062 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `node scripts/asset-qa/verify-dispatch-equipment-models.mjs` — passed
- `npm run build` — passed
- `git diff --check` — passed
- Dispatch TypeScript check — clean; full `tsc` still has known legacy non-dispatch errors on this PR branch.
- Vercel Preview deploy — passed
- External preview suite — passed

## Safety

This remains a demo/read-only digital twin layer over existing BMS/SCADA. The SCADA/I-O mapping tab does not create write commands.

## Next Recommended Micro-goal

MODE=CONTENT: structured AI insights categories, or MODE=DESIGN/QA: mobile horizontal overflow / top PV-1 viewer crop audit.
