# UPGR Codex Task Template And Delivery Checklist

## Mandatory Task Header

Every future Codex task must begin with:

```text
BASELINE DEPLOYMENT = 9neq7QhjbgvThCjBUnRYLNKzHTB6
BASELINE COMMIT = 4a2e07b
```

## Mandatory Baseline Confirmation

Every future task must explicitly confirm:

```text
baseline preserved = YES/NO
```

## Base-Branch And Scope Rules

- No future task may introduce regression relative to this accepted production baseline.
- No future branch may be treated as a valid base until `main` is synchronized to this accepted baseline.
- If the working branch does not descend from commit `4a2e07b`, stop and realign before coding.
- `docs/UPGR_BASELINE.md` is the route-source-of-truth for baseline smoke validation.

## Delivery Checklist

- Baseline constants verified against the accepted production baseline.
- `baseline preserved = YES/NO` stated explicitly in the task result.
- Accepted production baseline routes preserved unless a manually accepted baseline update is performed.
- No external GitHub or Vercel settings changed unless explicitly requested.
- Preview validated manually when the task includes deployment validation.
- Final release signal, when applicable, is `READY FOR MANUAL PROMOTE`.
