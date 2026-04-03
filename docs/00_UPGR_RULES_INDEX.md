# UPGR Rules Index

## Accepted Production Baseline

- BASELINE DEPLOYMENT = 9neq7QhjbgvThCjBUnRYLNKzHTB6
- BASELINE COMMIT = 4a2e07b
- Canonical accepted production URL = https://upgradefor.com
- Canonical accepted route baseline = `docs/UPGR_BASELINE.md`

## Hard Rules For Every Future Task

- No future task may introduce regression relative to this accepted production baseline.
- No future branch may be treated as a valid base until `main` is synchronized to this accepted baseline.
- Every future Codex task must begin with:

```text
BASELINE DEPLOYMENT = 9neq7QhjbgvThCjBUnRYLNKzHTB6
BASELINE COMMIT = 4a2e07b
```

- Every future task must confirm: `baseline preserved = YES` or `baseline preserved = NO`.
- Baseline is NOT updated automatically by date/time.

## Canonical Document Order

1. `docs/00_UPGR_RULES_INDEX.md` for the top-level constants and non-negotiable rules.
2. `docs/01_UPGR_CURRENT_STATE_AND_BASELINES.md` for current baseline state and task-start requirements.
3. `docs/04_UPGR_GIT_GITHUB_VERCEL_RELEASE_POLICY.md` for GitHub, branch, preview, and production release policy.
4. `docs/10_UPGR_CODEX_TASK_TEMPLATE_AND_DELIVERY_CHECKLIST.md` for the mandatory future-task template and delivery checklist.
5. `docs/UPGR_BASELINE.md` for the exact accepted and excluded route lists plus the baseline update protocol.
