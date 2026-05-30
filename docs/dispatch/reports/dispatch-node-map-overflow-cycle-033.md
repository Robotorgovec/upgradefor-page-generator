# DISPATCH-CONTINUOUS / Cycle 033

Mode: DESIGN

Micro-goal: reduce remaining local overflow samples in the digital-twin node map without changing equipment behavior or model assets.

Branch: `fix/dispatch-3d-equipment-models-and-selection`

PR: https://github.com/Robotorgovec/upgradefor-page-generator/pull/292

## View Links

- Local review URL: http://127.0.0.1:3066/dispatch
- Preview URL: pending after push

## What Changed

- Tightened the digital twin isometric building footprint so transformed bounds stay inside the `twinStage`.
- Reworked node label placement so right-side nodes flip left earlier on narrow viewports.
- Reduced selected-node outline overflow by using `outline-offset` instead of a larger pseudo-element inset.
- Constrained node labels with explicit responsive width and text wrapping.
- Allowed the plant-room chips to wrap inside the isometric model instead of forcing local overflow.

No 3D assets, equipment data, read-only command logic, backend/API, or BMS/SCADA behavior were changed.

## Screenshots

- `docs/dispatch/reports/screenshots/cycle-033/00-full-page.png`
- `docs/dispatch/reports/screenshots/cycle-033/section-01-overview.png`
- `docs/dispatch/reports/screenshots/cycle-033/section-02-cooling.png`
- `docs/dispatch/reports/screenshots/cycle-033/section-03-fan-coils.png`
- `docs/dispatch/reports/screenshots/cycle-033/section-04-ventilation.png`
- `docs/dispatch/reports/screenshots/cycle-033/section-05-itp.png`
- `docs/dispatch/reports/screenshots/cycle-033/section-06-pumps.png`
- `docs/dispatch/reports/screenshots/cycle-033/section-07-heat-exchangers.png`
- `docs/dispatch/reports/screenshots/cycle-033/section-08-alarms.png`
- `docs/dispatch/reports/screenshots/cycle-033/section-09-trends.png`
- `docs/dispatch/reports/screenshots/cycle-033/section-10-equipment.png`
- `docs/dispatch/reports/screenshots/cycle-033/section-11-tickets.png`
- `docs/dispatch/reports/screenshots/cycle-033/section-12-ai.png`
- `docs/dispatch/reports/screenshots/cycle-033/99-mobile-full-page.png`

## Verification Notes

- Desktop global horizontal overflow: `false`.
- Mobile global horizontal overflow: `false`.
- Before the final node-placement fix, mobile audit still reported `twinStage` local overflow.
- After the final node-placement fix, `twinStage`, `equipmentNode`, and `plantRoom` disappeared from the mobile overflow samples.
- Remaining mobile samples are outside this micro-goal: `sectionDetailPanel` and `sectionDetailHeader`.
- Bottom navigation still intentionally reports scrollable child samples because it is a horizontally scrollable sticky nav.

## QA

- `node --check scripts/dispatch-smoke-test.mjs` — not available in this worktree (`MODULE_NOT_FOUND`)
- `node --check scripts/asset-qa/capture-dispatch-fullpage-review.mjs` — passed
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3066 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed, 10/10
- `node scripts/asset-qa/verify-dispatch-equipment-models.mjs` — passed, 6 GLB references checked
- `npm run test:layout` — passed
- `npx tsc --noEmit --pretty false 2>&1 | rg 'dispatch|Dispatch' || true` — passed, no dispatch errors
- `npm run build` — passed
- `npx tsc --noEmit --pretty false` — failed on known legacy non-dispatch groups: account searchParams, selector Prisma/logs, beauty grids, copper-aluminum manufacturers
- `git diff --check` — passed

## What Sergey Should Review

- On desktop, the digital-twin node map labels should sit inside the map without edge clipping.
- On mobile, the digital-twin node map should no longer create a local `twinStage` overflow sample.
- The 3D equipment twins and read-only safety copy should behave exactly as before.

## Next Recommended Cycle

MODE=DESIGN or MODE=QA: fix the remaining mobile `sectionDetailPanel` / `sectionDetailHeader` local overflow and continue the full-page section audit.

## Safety

This remains a demo/read-only digital twin layer over existing BMS/SCADA. No live control commands were added or implied.
