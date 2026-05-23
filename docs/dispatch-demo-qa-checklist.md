# Dispatch Demo QA Checklist

Last checked: 2026-05-23

Use this checklist before sharing the `/dispatch` investor demo externally.

## Build Checks

Run locally:

```bash
npm run test:layout
npm run test:dispatch
npm run typecheck
npm run build
git diff --check
```

The combined local gate is:

```bash
npm run test:ci
```

## Local Smoke Checks

```bash
npm run test:dispatch
```

Expected coverage:

- `/dispatch`
- `/dispatch?demo=investor`
- `/dispatch?equipment=fc-021&tab=telemetry`
- `/dispatch?equipment=ch-001&tab=3d`
- `/dispatch?equipment=unknown-id&tab=telemetry`
- `/dispatch?equipment=fc-021&tab=random`
- Investor flow: launch, incident, affected equipment, Alarms tab, command modal, simulated confirmation, journal, timeline, reset.

## Deployed Smoke Checks

Use the same smoke script against a preview/staging domain:

```bash
DISPATCH_BASE_URL=https://upgradefor-page-generator-fbbkmtpjw-bacalimser-8615s-projects.vercel.app npm run test:dispatch
```

Do this after deployment and before sending the URL to investors or customers.

Last deployed smoke result: passed on 2026-05-23.

Manual investor flow result: passed on 2026-05-23.

## Demo URLs

Local:

```txt
http://localhost:3000/dispatch?demo=investor
```

Deployed:

```txt
https://upgradefor-page-generator-fbbkmtpjw-bacalimser-8615s-projects.vercel.app/dispatch?demo=investor
```

Preview/staging base URL:

```txt
https://upgradefor-page-generator-fbbkmtpjw-bacalimser-8615s-projects.vercel.app
```

This is a temporary Vercel preview URL. Re-run deployed smoke if a new preview URL is created.

## API Endpoints

The smoke test checks:

- `GET /api/dispatch/snapshot`
- `GET /api/dispatch/telemetry/fc-021`
- `GET /api/dispatch/telemetry/unknown-id`
- `POST /api/dispatch/commands`

Expected behavior:

- Snapshot returns `ok: true`.
- `fc-021` telemetry returns `ok: true`.
- Unknown telemetry returns HTTP `404` with `ok: false`.
- Commands return `simulated_accepted` and explicitly say no real equipment control.

## Known Safety Copy

Safe wording:

- "Demo Mode."
- "Simulated telemetry."
- "No real equipment control."
- "Command confirmed in demo mode."
- "Demo KPI estimate."
- "Backend integration required for production execution."

Do not claim:

- promised savings or guaranteed financial outcomes.
- physical equipment control.
- connected production telemetry.
- actual alarm resolution from the demo command.
- completed production control.

## Investor Flow Go/No-Go

Current status: GO for the preview URL checked on 2026-05-23.

Go only if all are true:

- Build and smoke checks pass.
- Deployed smoke passes for the public/preview URL.
- `/dispatch?demo=investor` opens the presentation overlay.
- **Start cooling incident** selects the affected pump and opens Alarms.
- Probable cause and recommended action are visible.
- Command confirmation modal uses demo/simulated/no real control copy.
- Confirming writes the journal and advances the scenario timeline.
- Reset returns to normal/idle.
- 3D failures do not block the operating workflow.

No-go if any are true:

- The page fails to load.
- Any dispatch API smoke endpoint fails unexpectedly.
- The demo implies real equipment was controlled.
- The command modal is missing the simulation guardrail.
- The scenario cannot be reset before the next walkthrough.

## Fallback If Preview URL Is Missing

If no preview/staging URL is available, keep the demo in conditional mode and run local checks:

```bash
npm run test:ci
npm run test:dispatch
```

When a new preview URL is available, run:

```bash
DISPATCH_BASE_URL=https://<preview-or-staging-domain> npm run test:dispatch
```
