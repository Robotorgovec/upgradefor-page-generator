# DISPATCH-CONTINUOUS / Cycle 034

Mode: DESIGN

Micro-goal: remove the remaining mobile local overflow samples in `sectionDetailPanel` / `sectionDetailHeader`.

Branch: `fix/dispatch-3d-equipment-models-and-selection`

PR: https://github.com/Robotorgovec/upgradefor-page-generator/pull/292

## View Links

- Local review URL: http://127.0.0.1:3067/dispatch
- Preview URL: https://upgradefor-page-generator-git-204210-bacalimser-8615s-projects.vercel.app/dispatch
- Preview deployment: https://upgradefor-page-generator-9tdkbdgpd-bacalimser-8615s-projects.vercel.app

## What Changed

- Added safe box sizing and `min-width: 0` to the selected module detail panel.
- Allowed the selected module header to wrap on narrow screens.
- Made the title and status badge shrink/wrap without forcing the container wider than the viewport.
- Preserved the existing desktop layout, equipment behavior, read-only controls, 3D assets, BMS/SCADA safety copy, and action flows.

## Screenshots

- `docs/dispatch/reports/screenshots/cycle-034/00-full-page.png`
- `docs/dispatch/reports/screenshots/cycle-034/section-01-overview.png`
- `docs/dispatch/reports/screenshots/cycle-034/section-02-cooling.png`
- `docs/dispatch/reports/screenshots/cycle-034/section-03-fan-coils.png`
- `docs/dispatch/reports/screenshots/cycle-034/section-04-ventilation.png`
- `docs/dispatch/reports/screenshots/cycle-034/section-05-itp.png`
- `docs/dispatch/reports/screenshots/cycle-034/section-06-pumps.png`
- `docs/dispatch/reports/screenshots/cycle-034/section-07-heat-exchangers.png`
- `docs/dispatch/reports/screenshots/cycle-034/section-08-alarms.png`
- `docs/dispatch/reports/screenshots/cycle-034/section-09-trends.png`
- `docs/dispatch/reports/screenshots/cycle-034/section-10-equipment.png`
- `docs/dispatch/reports/screenshots/cycle-034/section-11-tickets.png`
- `docs/dispatch/reports/screenshots/cycle-034/section-12-ai.png`
- `docs/dispatch/reports/screenshots/cycle-034/99-mobile-full-page.png`

## Verification Notes

- Desktop global horizontal overflow: `false`.
- Mobile global horizontal overflow: `false`.
- Mobile overflow samples: `[]`.
- The prior cycle's remaining mobile samples for `sectionDetailPanel` and `sectionDetailHeader` are no longer reported.
- Bottom navigation still intentionally reports scrollable child samples on desktop because it is a horizontally scrollable sticky nav.

## QA

- `node --check scripts/dispatch-smoke-test.mjs` — not available in this worktree (`MODULE_NOT_FOUND`)
- `node --check scripts/asset-qa/capture-dispatch-fullpage-review.mjs` — passed
- `node --check scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed
- `DISPATCH_BASE_URL=http://127.0.0.1:3067 node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed, 10/10
- `node scripts/asset-qa/verify-dispatch-equipment-models.mjs` — passed, 6 GLB references checked
- `npm run test:layout` — passed
- `npx tsc --noEmit --pretty false 2>&1 | rg 'dispatch|Dispatch' || true` — passed, no dispatch errors after build
- `npm run build` — passed
- `npx tsc --noEmit --pretty false` — failed on known legacy non-dispatch groups: account searchParams, selector Prisma/logs, beauty grids, copper-aluminum manufacturers
- `git diff --check` — passed
- `DISPATCH_BASE_URL=https://upgradefor-page-generator-git-204210-bacalimser-8615s-projects.vercel.app node scripts/asset-qa/verify-dispatch-preview-suite.mjs` — passed, 10/10
- External full-page capture on the branch preview — passed; desktop/mobile global horizontal overflow `false`, mobile overflow samples `[]`
- Browser error check on branch preview — passed; no page errors reported

## What Sergey Should Review

- Mobile full-page screenshot: selected module detail panel should no longer widen the page.
- Desktop full-page screenshot: section detail header should look unchanged and readable.
- Read-only/demo/no real equipment control copy remains visible.

## Next Recommended Cycle

MODE=QA: full action-link audit for `node → passport → trends → ticket → AI`, because layout overflow is now clean in the current automated full-page mobile audit.

## Safety

This remains a demo/read-only digital twin layer over existing BMS/SCADA. No live control commands were added or implied.
