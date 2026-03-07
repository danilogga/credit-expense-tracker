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

Environment requires `DATABASE_URL` (e.g. `postgresql://postgres:postgres@localhost:5432/credit_expense_tracker`).

No test framework is configured.

## Architecture

**Next.js App Router with Server Components.** All pages are async Server Components that fetch data directly from Prisma. Client interactivity is isolated to small `"use client"` components in `src/components/`.

**Data flow:**
- Pages (`src/app/*/page.tsx`) — read data via Prisma, render HTML
- Server Actions (`src/app/actions.ts`) — handle all mutations, always end with `redirect()` carrying `?ok=...` or `?error=...` query params
- `QueryToast` component reads those params and shows a SweetAlert2 toast
- Business logic lives in `src/lib/domain.ts`; pages and actions import from there

**Key lib modules:**
- `src/lib/domain.ts` — all domain logic: CSV import, invoice month computation, billing settings, dashboard aggregation
- `src/lib/prisma.ts` — singleton Prisma client (global cache in dev, uses `@prisma/adapter-pg` driver adapter)
- `src/lib/money.ts` — `parseMoneyToCents()` (handles R$, comma decimals) and `formatCents()` (pt-BR BRL)
- `src/lib/date.ts` — `toMonthKey()` (→ `YYYY-MM`), `parseCsvDate()` (multi-format), `resolveMonthKey()`
- `src/lib/normalize.ts` — `normalizeEstablishment()`: lowercase + trim + collapse whitespace
- `src/lib/constants.ts` — default categories, `normalizeCategoryIcon()` (validates lucide icon names)

## Data Model

**Money** is always stored as integer cents. Never use floats for amounts.

**Month keys** are `YYYY-MM` strings used throughout (invoice month, budget month, override month).

**Invoice month logic** (in `computeInvoiceMonth`): a purchase made on or before the closing day of its month → billed in month+1; after the closing day → month+2. The closing day can be overridden per-month via `BillingClosingOverride`.

**Deduplication**: Expenses have a unique `fingerprint` = `date|normalizedMerchantName|amountCents`. `importCsvContent` uses `createMany({ skipDuplicates: true })`.

**Merchant reclassification**: Changing a merchant's category updates all existing expenses for that merchant in a single transaction (`setMerchantCategory` in domain.ts).

**Category icons** are stored as `phosphor:icon-name` strings and rendered with `@phosphor-icons/react`. `normalizeCategoryIcon()` in `src/lib/constants.ts` validates the prefix; available icons are keyed in `PHOSPHOR_ICON_MAP` in `src/lib/icons.ts`. In server components, import from `@phosphor-icons/react/dist/ssr`; in client components, import from `@phosphor-icons/react`.

**`ensureDefaults()`** is called on dashboard load to seed default categories and the singleton `BillingSettings` row (id=1, defaultClosingDay=31). Always call it before reads that depend on default data existing.

## Styling

Global CSS only — no Tailwind, no CSS Modules. All styles in `src/app/globals.css` using CSS custom properties (`--teal`, `--orange`, `--panel`, etc.). Use the existing CSS classes (`.panel`, `.stat`, `.muted`, `.warn`, `.tag`, `.inline`, `.grid`) for new UI.
