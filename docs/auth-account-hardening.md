# Auth / Account Hardening Runbook

## Deployment

- Production deploys stay manual. Final status for this track is `READY FOR MANUAL PROMOTE`.
- Vercel should run `npm run vercel-build` so Prisma client generation, migrations, and Next build happen in one step.
- Keep Preview and Production on separate databases. Never point preview deployments at the production `DATABASE_URL`.

## Required Environment

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `AUTH_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `BLOB_READ_WRITE_TOKEN`

## Email

- Resend requests include an explicit `User-Agent` header.
- In non-production environments, verification and reset links can still be inspected from server logs.

## Avatar Uploads

- Do not write uploads to the repo filesystem or `public/`.
- Avatar uploads use Vercel Blob through `BLOB_READ_WRITE_TOKEN`.
- Keep uploads below Vercel function body limits and prefer direct-to-storage patterns if payload size grows.

## Security Notes

- Password validation enforces a minimum length and bcrypt's 72-byte maximum input size.
- State-changing account endpoints validate same-origin requests as a defense-in-depth layer on top of framework defaults.
