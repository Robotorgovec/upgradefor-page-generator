# Dispatch Contextual Demo Ticket — Cycle 040

Date: 2026-05-31  
Branch: `fix/dispatch-3d-equipment-models-and-selection`  
Scope: `/dispatch` read-only demo UI only.

## Purpose

Cycle 040 improves the operator workflow behind `Create demo ticket`. Before this cycle, the modal confirmed that a
demo ticket existed, but it did not show the operational payload that would be handed to a future CMMS / Service Desk
integration.

This cycle keeps the product read-only: no backend, DB, WebSocket, auth, external ticket submission, or BMS/SCADA write
command was added.

## What Changed

Updated:

```text
src/components/dispatch/DispatchDashboard.tsx
scripts/asset-qa/verify-dispatch-action-flows.mjs
```

The ticket modal now shows a structured demo payload:

- object: `Asia Park Astana`;
- current section;
- selected equipment;
- source tag;
- severity;
- current demo timestamp;
- event context;
- AI recommendation;
- send status: `Prepared locally · not sent · No real equipment control`.

## QA Coverage Added

`verify-dispatch-action-flows.mjs` now requires the ticket modal to include:

- `Demo-заявка подготовлена локально`;
- object context;
- section context;
- equipment context;
- source tag context;
- severity context;
- AI recommendation context;
- `not sent`;
- `No real equipment control`.

## Local QA Evidence

Commands:

```text
DISPATCH_ACTION_FLOW_OUTPUT_DIR=docs/dispatch/reports/screenshots/cycle-040/action-flow \
DISPATCH_BASE_URL=http://127.0.0.1:3073 \
node scripts/asset-qa/verify-dispatch-action-flows.mjs
```

Result:

```json
{
  "checked": "dispatch-action-flows",
  "ok": true
}
```

Full local dispatch suite:

```text
DISPATCH_BASE_URL=http://127.0.0.1:3073 node scripts/asset-qa/verify-dispatch-preview-suite.mjs
```

Result: 11/11 checks passed.

## Screenshots

Action-flow screenshots:

```text
docs/dispatch/reports/screenshots/cycle-040/action-flow/
```

Primary screenshot to review:

```text
docs/dispatch/reports/screenshots/cycle-040/action-flow/action-01-ticket-modal.png
```

Full-page screenshot set:

```text
docs/dispatch/reports/screenshots/cycle-040/
```

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

The demo ticket flow is now more operational: it clearly shows what would be sent later while still saying that nothing
is sent now and no real equipment is controlled.

## Remaining Notes

- This is a frontend-only workflow improvement.
- External CMMS / Service Desk integration remains a future backend/API task.
- All command-like flows remain demo/read-only.
