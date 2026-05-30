# DISPATCH-CONTINUOUS / cycle 025

Mode: CONTENT

Micro-goal: add alarm severity labels and SLA timers to the dispatch alarm/event cards.

## Result

- Alarm events now use explicit severity levels: `Critical`, `Warning`, and `Info`.
- Each visible alarm card includes an SLA timer with status metadata.
- Critical DP `DATA_ERROR` shows a due-soon SLA timer.
- Warning alarms show on-track SLA timers.
- Info/service notification is no longer represented as `service` severity; it is visible as `Info` with monitoring/no-emergency-SLA copy.
- Existing read-only/demo safety remains unchanged.

## View

Local production view: http://127.0.0.1:3060/dispatch

Vercel Preview is attempted after commit/push. If quota is still exhausted, use the local view and retry deploy after quota reset.

## Screenshots

- `docs/dispatch/reports/screenshots/cycle-025/01-alarm-severity-sla-overview.png`
- `docs/dispatch/reports/screenshots/cycle-025/02-selected-critical-sla-context.png`
- `docs/dispatch/reports/screenshots/cycle-025/03-mobile-alarm-sla.png`
- `docs/dispatch/reports/screenshots/cycle-025/04-info-sla-card.png`

## QA

- `node --check scripts/asset-qa/verify-dispatch-alarm-severity-sla.mjs` — passed
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `npm run test:layout` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3060 node scripts/asset-qa/verify-dispatch-alarm-severity-sla.mjs` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3060 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `node scripts/asset-qa/verify-dispatch-equipment-models.mjs` — passed
- `npm run build` — passed
- `git diff --check` — passed
- `npx tsc --noEmit --pretty false` — known legacy non-dispatch errors remain on this PR branch; `rg dispatch` found no dispatch TypeScript errors.

## Safety

This remains a demo/read-only digital twin layer over existing BMS/SCADA. The SLA timers are presentation/readiness indicators only; no real alarm acknowledgement or equipment command is sent.

## Next Recommended Micro-goal

MODE=CONTENT: equipment passport top KPI row, or MODE=DESIGN/QA for mobile horizontal overflow.
