# TypeScript Errors Outside Dispatch

Last checked: 2026-05-22

Command:

```bash
npx tsc --noEmit --pretty false
```

Status: failing because of legacy errors outside the R002/R003/R004/R005 dispatch workspace. A filtered check against `app/api/dispatch`, `app/dispatch`, `src/components/dispatch`, and `src/lib/dispatch` returns no matches.

## Current Error Groups

### Account query params

Files:

- `app/account/login/login-form.tsx`
- `app/account/reset/page.tsx`
- `app/account/verify/page.tsx`

Problem: `searchParams` is possibly `null` under the current TypeScript settings.

### Selector request route / Prisma JSON

File:

- `app/api/selector/request/route.ts`

Problems:

- `SelectorInputPayload` is not assignable to Prisma `InputJsonValue`.
- The selected Prisma result type does not expose `logs`.

### Beauty performer grids

Files:

- `components/wikimarket/beauty/bridal-makeup/BridalMakeupPerformerGrid.tsx`
- `components/wikimarket/beauty/wedding-hairstyles/WeddingHairstylesPerformerGrid.tsx`

Problem: filter/category arrays are inferred as `never`, so known tag/category strings are rejected.

### Copper-aluminum manufacturer ranking

File:

- `components/wikimarket/hvac/copper-aluminum-heat-exchangers/manufacturers.ts`

Problems:

- Type predicate does not narrow to the required card type.
- Several sorted values are still possibly `null`.
- `_placement` is accessed on a value that may be `null`.
- `ratingAvg` is possibly `null` or `undefined`.

## R005 Dispatch Note

The R005 dispatch files are not part of the failing TypeScript output:

- `app/dispatch/page.tsx`
- `app/api/dispatch/snapshot/route.ts`
- `app/api/dispatch/telemetry/[equipmentId]/route.ts`
- `app/api/dispatch/commands/route.ts`
- `src/components/dispatch/DispatchWorkspace.tsx`
- `src/components/dispatch/EquipmentModelViewer.tsx`
- `src/lib/dispatch/dispatch-api-client.ts`
- `src/lib/dispatch/dispatch-api-contract.ts`
- `src/lib/dispatch/dispatch-data-provider.ts`
- `src/lib/dispatch/dispatch-simulation-service.ts`
- `src/lib/dispatch/mock-object.ts`
- `src/lib/dispatch/selectors.ts`
- `src/lib/dispatch/types.ts`
- `src/lib/dispatch/workspace-state.ts`
