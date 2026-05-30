# Dispatch Action-State QA — Cycle 039

Date: 2026-05-31  
Branch: `fix/dispatch-3d-equipment-models-and-selection`  
Scope: `/dispatch` read-only demo UI only.

## Purpose

Cycle 039 hardens the dispatch QA gate against silent active-looking controls. The page already had strong read-only
copy and modal/audit behavior, but the action-state verifier only inspected the initial viewport. This cycle extends
that verifier across every dispatch section plus the ticket modal and passport drawer.

This does not add backend, DB, WebSocket, auth, production BMS/SCADA commands, or any new 3D model.

## What Changed

Updated:

```text
scripts/asset-qa/verify-dispatch-action-states.mjs
```

The verifier now:

- opens `/dispatch`;
- checks the initial view for read-only/demo/no-real-control safety copy;
- clicks all 12 dispatch sections;
- verifies each section has no visible control without an inferred/explicit action state;
- verifies no duplicate primary `Разобрать установку` CTA appears;
- opens the demo ticket modal and verifies its controls have action states;
- opens the passport drawer and verifies its controls have action states;
- keeps the existing checks for read-only PV-1 action chips and local audit messaging.

## Sections Checked

- Обзор объекта
- Холодоснабжение / чиллеры
- Кондиционирование / фанкойлы
- Вентиляция
- Теплоснабжение / ИТП
- Насосные группы
- Теплообменники
- Аварии
- Тренды
- Паспорта оборудования
- Заявки
- AI-диагностика

## Local QA Evidence

Command:

```text
DISPATCH_BASE_URL=http://127.0.0.1:3072 node scripts/asset-qa/verify-dispatch-action-states.mjs
```

Result:

```json
{
  "checked": "dispatch-action-states",
  "totalControls": 113,
  "explicitActionStates": 19,
  "primaryDisassemblyCtas": 1,
  "sectionsChecked": 12,
  "ok": true
}
```

Full local dispatch suite:

```text
DISPATCH_BASE_URL=http://127.0.0.1:3072 node scripts/asset-qa/verify-dispatch-preview-suite.mjs
```

Result: 11/11 checks passed, including `action-flows` and the expanded `action-states`.

## Screenshots

Full-page screenshot set:

```text
docs/dispatch/reports/screenshots/cycle-039/
```

The set includes:

- `00-full-page.png`
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
- `99-mobile-full-page.png`

Full-page audit summary:

```json
{
  "sectionScreenshots": 12,
  "expectedSections": 12,
  "desktopHorizontalOverflow": false,
  "mobileHorizontalOverflow": false,
  "desktopOverflowSamples": [],
  "mobileOverflowSamples": []
}
```

## Decision

Action-state QA is stronger after this cycle. The verifier now covers the complete section set and the primary modal /
drawer states, so future silent-click regressions are more likely to fail CI-style dispatch smoke before reaching a
preview.

## Remaining Notes

- This is a QA gate improvement, not a visual redesign.
- Known non-dispatch TypeScript debt is outside this cycle.
- Real BMS/SCADA commands remain blocked; all command-like actions are demo/read-only.
