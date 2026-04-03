# UPGR Git, GitHub, And Vercel Release Policy

## Accepted Production Baseline

- BASELINE DEPLOYMENT = 9neq7QhjbgvThCjBUnRYLNKzHTB6
- BASELINE COMMIT = 4a2e07b
- Accepted production URL = https://upgradefor.com

## Branch Validity And Regression Policy

- No future task may introduce regression relative to this accepted production baseline.
- No future branch may be treated as a valid base until `main` is synchronized to this accepted baseline.
- Pull requests intended for `main` must keep commit `4a2e07b` as an ancestor of `HEAD`.
- Repository-level regression protection is enforced by `.github/workflows/baseline-guard.yml`.

## Baseline Update Policy

- Baseline is NOT updated automatically by date/time.
- Baseline updated only after:
  1. preview accepted manually
  2. production promoted / accepted
  3. baseline file updated

## GitHub And Vercel Change Control

- Production Promote in Vercel is manual only by Sergey.
- `READY FOR MANUAL PROMOTE` may be declared only after preview validation, successful required checks, and explicit baseline preservation confirmation.
- This baseline-freeze pass does not modify GitHub settings, Vercel project settings, or `vercel.json`.

## Mandatory Future-Task Header

Every future Codex task must begin with:

```text
BASELINE DEPLOYMENT = 9neq7QhjbgvThCjBUnRYLNKzHTB6
BASELINE COMMIT = 4a2e07b
```

Every future task must confirm:

```text
baseline preserved = YES/NO
```
