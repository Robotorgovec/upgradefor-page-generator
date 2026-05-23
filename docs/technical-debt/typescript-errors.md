# TypeScript Errors Outside Dispatch

Last checked: 2026-05-23

Command:

```bash
npm run typecheck
```

Status: resolved in R008. The full project typecheck now passes without weakening `tsconfig` or hiding errors behind broader casts.

## Fixed Legacy Groups

### Account query params

Files:

- `app/account/login/login-form.tsx`
- `app/account/reset/page.tsx`
- `app/account/verify/page.tsx`

Resolution: `useSearchParams()` reads are null-safe, and the reset form submit handler uses `FormEvent<HTMLFormElement>` instead of an untyped event.

### Selector request route / Prisma JSON

File:

- `app/api/selector/request/route.ts`

Resolution: selector input is projected into a Prisma-compatible JSON object before create, preserving the current payload shape and nested `logs` include behavior.

### Beauty performer grids

Files:

- `components/wikimarket/beauty/bridal-makeup/BridalMakeupPerformerGrid.tsx`
- `components/wikimarket/beauty/wedding-hairstyles/WeddingHairstylesPerformerGrid.tsx`

Resolution: performer filter state now uses explicit tag union types, and readonly literal tag/category arrays are widened only at the local `includes` checks.

### Copper-aluminum manufacturer ranking

File:

- `components/wikimarket/hvac/copper-aluminum-heat-exchangers/manufacturers.ts`

Resolution: category merge rows use a typed card-with-placement shape, nullable rows are filtered with a proper predicate, and rating pair checks now narrow `ratingAvg`/`ratingCount`.

## R008 Verification

The green CI/deploy gate is:

```bash
npm run test:layout
npm run test:dispatch
npm run typecheck
npm run build
git diff --check
```

`npm run test:ci` runs the layout smoke, dispatch smoke, typecheck, and build sequence.
