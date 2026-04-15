# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Next.js with Turbopack
npm run build        # Production build
npm run lint         # Run ESLint

# Database
npx prisma migrate dev    # Run migrations and regenerate client
npx prisma generate       # Regenerate Prisma client after schema changes
```

Environment variables required:
- `DATABASE_URL` — e.g. `postgresql://postgres:postgres@localhost:5432/credit_expense_tracker`
- `AUTH_USERNAME`, `AUTH_PASSWORD`, `AUTH_SECRET` — web session auth
- `API_TOKEN` — REST API bearer token

For production deploys, run `npx prisma migrate deploy` (not `migrate dev`) before `next build`.

No test framework is configured.

## Architecture

**Next.js App Router with Server Components.** All pages are async Server Components that fetch data directly from Prisma. Client interactivity is isolated to small `"use client"` components in `src/components/`.

**Data flow:**
- Pages (`src/app/*/page.tsx`) — read data via Prisma, render HTML
- Server Actions (`src/app/actions.ts`) — handle all mutations; most end with `redirect()` carrying `?ok=...` or `?error=...` query params; toggle-style actions skip the redirect and just call `revalidatePath()`
- `QueryToast` component reads those params and shows a SweetAlert2 toast
- Business logic lives in `src/lib/domain.ts`; pages and actions import from there

**Session auth** is handled by `src/proxy.ts` (Next.js 16 `proxy()` function). It checks a `session` cookie against `process.env.AUTH_SECRET`. `/api/*` routes and `/login` bypass auth and handle themselves. `API_TOKEN` env var protects the REST API endpoint separately.

**Key lib modules:**
- `src/lib/domain.ts` — all domain logic: CSV import, invoice month computation, billing settings, dashboard aggregation
- `src/lib/prisma.ts` — singleton Prisma client (global cache in dev, uses `@prisma/adapter-pg` driver adapter)
- `src/lib/money.ts` — `parseMoneyToCents()` (handles R$, comma decimals) and `formatCents()` (pt-BR BRL)
- `src/lib/date.ts` — `toMonthKey()` (→ `YYYY-MM`), `parseCsvDate()` (multi-format), `resolveMonthKey()`
- `src/lib/normalize.ts` — `normalizeEstablishment()`: lowercase + trim + collapse whitespace
- `src/lib/constants.ts` — default categories, `normalizeCategoryIcon()` (validates `phosphor:` prefix)
- `src/lib/pagination.ts` — `PAGE_SIZE_OPTIONS`, `DEFAULT_PAGE_SIZE`, `PAGE_SIZE_COOKIE`
- `src/lib/pagination-server.ts` — `resolvePageSize()`: reads URL param → cookie fallback → default

## Data Model

**Money** is always stored as integer cents. Never use floats for amounts.

**Month keys** are `YYYY-MM` strings used throughout (invoice month, budget month, override month).

**Invoice month logic** (in `computeInvoiceMonth`): a purchase made on or before `defaultClosingDay` of its month → invoice month = purchase month; after the closing day → invoice month = purchase month + 1. Closing day is set globally via `BillingSettings` (singleton row id=1).

**Deduplication**: Expenses have a unique `fingerprint` = `date|normalizedMerchantName|amountCents`. `importCsvContent` uses `createMany({ skipDuplicates: true })`.

**Merchant reclassification**: Changing a merchant's category updates all existing expenses for that merchant in a single transaction (`setMerchantCategory` in domain.ts).

**Ignored expenses**: The `ignored` boolean on `Expense` (default `false`) excludes the expense from all totals — both `dashboardForMonth` and the invoices `groupBy` query filter `ignored: false`. The expense still appears in lists; toggling is done via `toggleExpenseIgnoredAction` which revalidates without redirect.

**Category icons** are stored as `phosphor:icon-name` strings and rendered with `@phosphor-icons/react`. `normalizeCategoryIcon()` in `src/lib/constants.ts` validates the prefix; available icons are keyed in `PHOSPHOR_ICON_MAP` in `src/lib/icons.ts`. In server components, import from `@phosphor-icons/react/dist/ssr`; in client components, import from `@phosphor-icons/react`. When using Phosphor icons in `"use client"` components, prefer inline SVG over the icon component if bundling issues arise.

**`ensureDefaults()`** is called on dashboard load to seed default categories and the singleton `BillingSettings` row (id=1, defaultClosingDay=31). Always call it before reads that depend on default data existing.

## REST API

`GET /api/dashboard` — read-only endpoint consumed by the iOS app. Auth: `Authorization: Bearer ${API_TOKEN}`. Query params: `month` (YYYY-MM), `page`, `pageSize`, `categoryId`, `q`. Returns `{ month, invoiceClosed, totalSpentCents, categories[], pagination, expenses[] }`. Expenses include `ignored: boolean`; `totalSpentCents` already excludes ignored expenses.

Interactive docs (Swagger UI) at `/api/docs`; OpenAPI spec at `/api/openapi.json`.

## Styling

Global CSS only — no Tailwind, no CSS Modules. All styles in `src/app/globals.css` using CSS custom properties (`--teal`, `--orange`, `--panel`, etc.). Use the existing CSS classes (`.panel`, `.stat`, `.muted`, `.warn`, `.tag`, `.inline`, `.grid`) for new UI.

**Selected month persistence**: The dashboard saves the selected invoice month in a cookie (`creditexp:selectedInvoiceMonth`) via the `InvoiceMonthMemory` client component. The server reads this cookie in `page.tsx` so the correct month is rendered on first load with no client-side redirect flash.
