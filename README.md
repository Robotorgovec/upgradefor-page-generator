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

## Auth (Stage 2)

Stage 2 wires up Auth.js (Credentials) for login/logout and a protected account page.

### Environment

- `AUTH_SECRET`
- `NEXTAUTH_URL`

### Commands

```bash
npm run user:create -- --email user@example.com --password "your-password"
```

### Manual check

1. Create a test user with the command above.
2. Open `/account/login` and sign in.
3. Confirm you are redirected to `/account` and see account data.
4. Click "Выйти" to log out.
