# upgradefor-page-generator

## Database / Prisma

This stage prepares models for future authentication and account features.

### Environment

- `DATABASE_URL` (PostgreSQL connection string)

Example:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
```

### Commands

```bash
npx prisma migrate dev
npx prisma generate
npm run db:smoke
```
