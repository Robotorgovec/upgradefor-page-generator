# Baseline Lock Record (UPGR-03)

Updated: 2026-04-16 (UTC)

## Approved production baseline (source of truth)
- Repository: `Robotorgovec/upgradefor-page-generator`
- Production URL: `https://upgradefor.com`
- Vercel project: `upgradefor-page-generator`
- Approved deployment ID: `dpl_7vdjiCQnmaBbE7kSmPA8ne5wJkaR`
- Approved commit SHA: `dd07e74ff0c8ec1d0e4608f689fda81bd43df85a`
- Approved commit message: `Refine homepage trust-strip icon shell`
- Deployment source ref (at deploy time): `codex/home-icons-preview-deploy`

## Baseline policy (lock)
1. The exact commit `dd07e74ff0c8ec1d0e4608f689fda81bd43df85a` is the approved baseline until explicitly superseded by a separate baseline update.
2. Any later preview/deployment/branch/diff is **not** baseline automatically.
3. New work must start from this approved baseline, or from `main` only after explicit alignment to this baseline is verified and recorded.
4. Feature work is blocked until baseline-lock + main-alignment verification is complete.

## Technical verification snapshot (current environment only)
- Local branch: `work`
- Local `main` ref: missing in this clone
- Commit `dd07e74ff0c8ec1d0e4608f689fda81bd43df85a`: not present in local object database (`git cat-file -e` / `git show` failed)
- Remote fetch attempt (`origin = https://github.com/Robotorgovec/upgradefor-page-generator.git`): failed in current environment (`CONNECT tunnel failed, response 403`)

## Main alignment status
- Status in current environment: **UNVERIFIED**
- Reason: `origin/main` ancestry against approved commit could not be checked from this clone/environment
- Therefore, `main` must be treated as **not yet verified against baseline**, not as conclusively aligned or conclusively misaligned

## Required next safe action
1. In a network-enabled environment, fetch `origin/main`
2. Verify ancestry:
   `git merge-base --is-ancestor dd07e74ff0c8ec1d0e4608f689fda81bd43df85a origin/main`
3. If true:
   - record `main` as baseline-aligned
   - final status: `BASELINE LOCKED`
4. If false:
   - create a dedicated sync branch from `main`
   - prepare a minimal sync PR to restore `main` to the approved baseline state
   - final status: `BASELINE IDENTIFIED, MAIN NOT YET ALIGNED`

## Handover note
Until a separate explicit baseline update is approved, all future tasks must reference this baseline record and `dd07e74ff0c8ec1d0e4608f689fda81bd43df85a` as source of truth.
