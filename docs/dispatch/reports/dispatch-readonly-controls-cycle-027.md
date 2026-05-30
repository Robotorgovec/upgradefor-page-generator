# DISPATCH-CONTINUOUS / cycle 027

Mode: CONTENT

Micro-goal: strengthen read-only control guardrails for the Dispatch demo.

## Result

- Added a visible read-only policy banner above the control buttons.
- The banner shows the active role, `Operator`, and explains that controls are blocked in demo mode.
- Disabled controls still use `cursor: not-allowed`, `disabled`, and the tooltip `Управление заблокировано (Demo mode)`.
- Local audit now records the role with each attempted control action.
- The modal copy remains explicit: no real equipment control, no BMS/SCADA write.

## View

Local production view during QA: http://127.0.0.1:3061/dispatch

Vercel Preview is created after commit/push.

## Screenshots

- `docs/dispatch/reports/screenshots/cycle-027/01-readonly-policy-banner.png`
- `docs/dispatch/reports/screenshots/cycle-027/02-readonly-attempt-modal.png`
- `docs/dispatch/reports/screenshots/cycle-027/03-mobile-readonly-policy.png`

## QA

- `node --check scripts/asset-qa/verify-dispatch-readonly-controls.mjs` — passed
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `npm run test:layout` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3061 node scripts/asset-qa/verify-dispatch-readonly-controls.mjs` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3061 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `node scripts/asset-qa/verify-dispatch-equipment-models.mjs` — passed
- `npm run build` — passed
- `git diff --check` — passed
- Dispatch TypeScript check — clean; full `tsc` still has known legacy non-dispatch errors on this PR branch.

## Safety

This remains a demo/read-only digital twin layer over existing BMS/SCADA. No real commands are sent to equipment.

## Next Recommended Micro-goal

MODE=CONTENT: SCADA tags passport tab, or MODE=DESIGN/QA: mobile horizontal overflow / top PV-1 viewer crop audit.
