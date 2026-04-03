# UPGR Current State And Baselines

## Accepted Production Baseline

- BASELINE DEPLOYMENT = 9neq7QhjbgvThCjBUnRYLNKzHTB6
- BASELINE COMMIT = 4a2e07b
- Canonical domain = https://upgradefor.com
- Exact accepted and excluded route lists are frozen in `docs/UPGR_BASELINE.md`.

## Current Baseline State

- The accepted production baseline is frozen at deployment `9neq7QhjbgvThCjBUnRYLNKzHTB6` and commit `4a2e07b`.
- Baseline is NOT updated automatically by date/time.
- No future task may introduce regression relative to this baseline.
- No future branch may be treated as a valid base until `main` is synchronized to this accepted baseline.
- A branch intended for future merge work must descend from commit `4a2e07b`.

## Route Classification Rule

- Any route that returns HTTP 200 on the accepted production baseline belongs in accepted routes.
- Excluded or not-ready routes may include only non-200 routes, absent routes, or unresolved dynamic patterns.
- Do not exclude a route without proof of non-200 status, absence, or unresolved dynamic pattern.
- Current recorded classification: 18 accepted static routes, 3 non-200 static routes, 2 unresolved dynamic patterns.

## Mandatory Future-Task Preamble

Every future Codex task must begin with:

```text
BASELINE DEPLOYMENT = 9neq7QhjbgvThCjBUnRYLNKzHTB6
BASELINE COMMIT = 4a2e07b
```

Every future task must confirm:

```text
baseline preserved = YES/NO
```
