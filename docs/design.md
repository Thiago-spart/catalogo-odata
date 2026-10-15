# Catálogo OData: design and plan

- **Date:** 2026-10-14
- **Status:** approved by Thiago in chat (design and Figma prototype), built the same night.
- **Figma:** https://www.figma.com/design/PtDRMHXsS4llMnbKdoye92

## Goal

A small, mobile-first product catalog on the public Northwind OData v4 service that shows, in five minutes of demo, how Thiago integrates a corporate API in React: typed contracts, safe query building, server-side paging, performance and automated tests.

## Scope

In: product list (search, category, sort, in-stock filter, paging, total count), product detail with `$expand`, loading, empty and error states, a live panel with the OData request behind each screen.

Out (listed in the README as next steps): writes, `$batch`, ETag concurrency, types generated from `$metadata`, the SAP sandbox behind a BFF, offline, Capacitor.

## Decisions

| # | Decision | Why |
|---|---|---|
| D1 | Call Northwind directly from the browser | It sends `Access-Control-Allow-Origin: *` and needs no key. A real SAP service needs a BFF; that is a next step. |
| D2 | A small pure query builder (`src/odata`) | Escapes string literals (`'` → `''`), so user input cannot change the filter. Pure, so it is unit-tested and also feeds the request panel. |
| D3 | Zod at the boundary (`src/api/schemas.ts`) | A contract change fails loudly with a typed error instead of rendering `undefined`. |
| D4 | Filters live in the URL (TanStack Router `validateSearch`) | A filtered view can be shared and survives reload; "Voltar" restores it. Invalid params fall back to defaults. |
| D5 | TanStack Query with a key factory, `placeholderData: keepPreviousData`, prefetch on intent | The previous page stays on screen while the next loads; the detail is usually cached before the tap. |
| D6 | Stable ordering (`ProductName` as tiebreaker) | Paging with `$skip` over an unstable order repeats or skips items. |
| D7 | Brand tokens from the Thiago Souza design system in Tailwind v4 `@theme` | One source for color, type and spacing. Fonts self-hosted for performance. |

## Structure

```
src/odata/      query.ts: literals, filters, buildQuery (pure)
src/api/        schemas.ts, client.ts (fetch + errors), products.ts (queries), queries.ts (TanStack Query options)
src/ui/         presentational components (cards, states, chips, panel)
src/routes/     router, list page, detail page
e2e/            Playwright against the real service, phone and desktop
```

## Testing

- Unit: query builder (escaping, encoding, combinations), list query mapping (filters, sort, page → `$skip`).
- Integration (Vitest + RTL + MSW): client errors and invalid payloads; list renders, empty, error with retry, filter writes to URL.
- E2E (Playwright, Pixel 7 and desktop): search, open detail, back keeps filters.
- CI: lint, typecheck, unit/integration, build, E2E.

## Plan

1. Scaffold, configs, tokens. 2. Query builder with tests. 3. Schemas, client, product queries with tests. 4. Router and pages. 5. UI states and request panel. 6. Integration tests. 7. E2E. 8. CI, README. 9. Repo, Vercel deploy. 10. Impeccable polish pass on the live product.
