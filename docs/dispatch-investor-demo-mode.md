# Dispatch Investor Demo Mode

Last checked: 2026-05-23

This runbook is for showing `/dispatch` as a frontend-only investor demo. The demo uses simulated telemetry, local scenario state, and mock API routes. It must not be described as production telemetry or real equipment control.

## Demo URLs

Local demo URL:

```txt
http://localhost:3000/dispatch?demo=investor
```

Deployed demo URL:

```txt
https://<preview-or-staging-domain>/dispatch?demo=investor
```

Use the deployed preview/staging URL from Vercel or the release environment. Keep the `?demo=investor` query param for one-click presentation mode.

## Pre-Demo Checklist

- `npm run test:ci` passed locally.
- Deployed smoke passed:

```bash
DISPATCH_BASE_URL=https://<preview-or-staging-domain> npm run test:dispatch
```

- `/dispatch?demo=investor` opens the presentation overlay.
- **Start cooling incident** selects the affected equipment and opens the Alarms tab.
- Probable cause and recommended action are visible in the Guided Incident card.
- **Prepare demo command** opens a confirmation modal.
- Confirmation copy says demo/simulated/no real equipment control.
- Command journal and scenario timeline update after confirmation.
- **Reset demo** returns the scenario to normal/idle state.

## Two-To-Three Minute Talk Track

1. Open `/dispatch?demo=investor`.
2. Show the Object Control Workspace: object status, floor-aware canvas, equipment tree, inspector, and bottom journal.
3. Explain that this is a simulated demo workspace, not a live BMS connection.
4. Click **Start cooling incident**.
5. Point out that the affected pump is selected, the Alarms tab opens, and the URL preserves equipment context.
6. Show the Guided Incident card: what happened, probable cause, and recommended next action.
7. Click **Prepare demo command**.
8. In the modal, read the simulation guardrail, then click **Confirm via simulation**.
9. Show KPI impact cards as demo estimates, not promised financial outcomes.
10. Open **Commands** or **History** to show the audit trail.
11. Click **Reset demo** before the next presentation.

## Presenter Controls

The script overlay contains:

- **Previous step** and **Next step** for guided narration.
- **Start cooling incident** for the opening step.
- **Reset demo** to return to baseline.
- **Hide script** for a cleaner screen.
- **Exit presentation** to keep the workspace in normal demo mode.

## Reset Instructions

Use **Reset demo** in the presentation overlay or left scenario control. It returns the scenario to normal operations and keeps the workspace safe for another walkthrough.

If the browser state feels stale, reload:

```txt
/dispatch?demo=investor
```

## Fallback Plans

### If 3D Model Fails

- Stay in Plan/Alarms/Telemetry views.
- Say: "3D is an optional inspection view; the operating workflow does not depend on it."
- Continue with the alarm triage, recommended action, command confirmation, and journal.

### If Deployed API Route Fails

- Do not claim live telemetry.
- Say: "The demo API route is unavailable, so the UI falls back to local simulated state."
- Show the object canvas, alarm context, safety guardrail, and documentation.
- Re-run:

```bash
DISPATCH_BASE_URL=https://<preview-or-staging-domain> npm run test:dispatch
```

## Safety Language

Use these phrases:

- "Demo Mode."
- "Simulated telemetry."
- "Command confirmed in demo mode."
- "Scenario advanced locally."
- "No real equipment was controlled."
- "Demo mitigation recorded."
- "Demo KPI estimate."
- "Backend integration is required for production execution."

Avoid wording that implies:

- a production command was executed;
- physical equipment was controlled;
- an alarm was actually resolved by a command;
- production control has completed;
- savings are guaranteed;
- production telemetry is connected.

## Smoke-Tested Path

`npm run test:dispatch` verifies the local flow. With `DISPATCH_BASE_URL`, the same script verifies a deployed/staging URL:

```bash
npm run test:dispatch
DISPATCH_BASE_URL=https://<preview-or-staging-domain> npm run test:dispatch
```

Covered checks:

- `/dispatch?demo=investor` opens the overlay and executive value cards.
- The cooling incident starts deterministically.
- Affected equipment opens on `tab=alarms`.
- The command confirmation modal posts only to the simulated API boundary.
- Journal and scenario timeline update.
- Reset returns the presentation to normal operations.
- R003/R005 deep links and API endpoints still work.
