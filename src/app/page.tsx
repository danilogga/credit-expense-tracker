import { Lock, LockOpen } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { resolveMonthKey } from "@/lib/date";
import { MonthYearSelect } from "@/components/month-year-select";
import { PaginationControl } from "@/components/pagination-control";
import { InvoiceMonthMemory } from "@/components/invoice-month-memory";
import { CategorySpendChart } from "@/components/category-spend-chart";
import { CategoryIcon } from "@/components/category-icon";
import { ExpenseCategoryCell } from "@/components/expense-category-cell";
import { MerchantNicknameCell } from "@/components/merchant-nickname-cell";
import { PageSizeSelect } from "@/components/page-size-select";
import { resolvePageSize } from "@/lib/pagination-server";
import { AutoSubmitForm } from "@/components/auto-submit-form";
import { SearchInput } from "@/components/search-input";
import { ExpenseInvoiceMonthCell } from "@/components/expense-invoice-month-cell";
import { ExpenseIgnoreToggle } from "@/components/expense-ignore-toggle";
import { QueryToast } from "@/components/query-toast";
import { dashboardForMonth, ensureDefaults, isInvoiceClosed } from "@/lib/domain";
import { formatCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? "#1a1a1a" : "#ffffff";
}

type SearchParams = Promise<{
  month?: string;
  filterMonth?: string;
  filterYear?: string;
  page?: string;
  pageSize?: string;
  categoryId?: string;
  q?: string;
  ok?: string;
  error?: string;
}>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const hasExplicitMonth = Boolean(params.month || params.filterMonth || params.filterYear);
  const cookieStore = await cookies();
  const savedMonth = !hasExplicitMonth ? cookieStore.get("creditexp:selectedInvoiceMonth")?.value : undefined;
  const month = resolveMonthKey({
    month: params.month ?? savedMonth,
    monthNumber: params.filterMonth,
    year: params.filterYear,
  });
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const categoryId = params.categoryId ?? null;
  const q = params.q?.trim() ?? "";
  const pageSize = await resolvePageSize(params.pageSize);
  const skip = (page - 1) * pageSize;

  await ensureDefaults();

  const expenseWhere = {
    invoiceMonth: month,
    ...(categoryId ? { categoryId } : {}),
    ...(q ? {
      merchant: {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { nickname: { contains: q, mode: "insensitive" as const } },
        ],
      },
    } : {}),
  };

  const [dashboard, totalExpenses, expenses, categories, invoiceClosed] = await Promise.all([
    dashboardForMonth(month),
    prisma.expense.count({ where: expenseWhere }),
    prisma.expense.findMany({
      where: expenseWhere,
      include: { merchant: true, category: true },
      orderBy: [{ expenseDate: "desc" }, { merchant: { name: "asc" } }],
      skip,
      take: pageSize,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true, symbol: true },
    }),
    isInvoiceClosed(month),
  ]);

  const spent = dashboard.totalSpentCents;
  const ignored = dashboard.totalIgnoredCents;
  const totalPages = Math.max(1, Math.ceil(totalExpenses / pageSize));

  return (
    <div>
      <InvoiceMonthMemory currentMonth={month} hasExplicitMonth={hasExplicitMonth} />
      <QueryToast successMessage={params.ok} errorMessage={params.error} />
      <div className="page-header">
        <div>
          <h1>Monitoramento</h1>
          <p className="muted">Despesas por mês de fatura</p>
        </div>
        <div className="inline">
          {invoiceClosed ? (
            <span className="invoice-status invoice-status-closed">
              <Lock size={13} weight="fill" />Fatura fechada
            </span>
          ) : (
            <span className="invoice-status invoice-status-open">
              <LockOpen size={13} weight="fill" />Fatura aberta
            </span>
          )}
          <AutoSubmitForm className="inline" method="get">
            <MonthYearSelect key={`dashboard-filter-${month}`} monthKey={month} idPrefix="dashboard-filter" />
          </AutoSubmitForm>
        </div>
      </div>

      <section className="panel stats">
        <div className="stat">
          <span className="muted">Total gasto (fatura)</span>
          <b>{formatCents(spent)}</b>
        </div>
        {ignored > 0 && (
          <div className="stat">
            <span className="muted">Total ignorado</span>
            <b className="muted">{formatCents(ignored)}</b>
          </div>
        )}
      </section>

      <section className="panel">
        <h3>Gasto por categoria</h3>
        <CategorySpendChart data={dashboard.byCategory} />
      </section>

      <section className="panel">
        <div className="page-header" style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>Despesas da fatura</h3>
          <SearchInput defaultValue={q} placeholder="Buscar por estabelecimento…" />
        </div>

        <div className="category-filter-bar">
          <Link
            href={`/?month=${month}`}
            className={categoryId ? "category-filter-all" : "category-filter-all category-filter-all-active"}
          >
            Todas
          </Link>
          {categories.map((cat) => {
            const active = categoryId === cat.id;
            const fg = contrastColor(cat.color);
            return (
              <Link
                key={cat.id}
                href={active ? `/?month=${month}` : `/?month=${month}&categoryId=${cat.id}`}
                className="category-pill category-filter-pill"
                style={
                  active
                    ? { backgroundColor: cat.color, color: fg }
                    : { backgroundColor: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}55` }
                }
              >
                <CategoryIcon icon={cat.symbol} color={active ? fg : cat.color} size={13} />
                {cat.name}
              </Link>
            );
          })}
        </div>

        <table>
          <thead>
            <tr>
              <th>Mês de referência</th>
              <th>Data da compra</th>
              <th>Estabelecimento</th>
              <th>Categoria</th>
              <th>Parcela</th>
              <th className="col-right">Valor</th>
              <th style={{ width: "44px" }}></th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={7}>Sem despesas para esta fatura.</td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className={expense.ignored ? "expense-ignored" : undefined}>
                  <td>
                    <ExpenseInvoiceMonthCell
                      expenseId={expense.id}
                      invoiceMonth={expense.invoiceMonth}
                      currentPageMonth={month}
                      page={page}
                    />
                  </td>
                  <td>{expense.expenseDate.toLocaleDateString("pt-BR")}</td>
                  <td>
                    <MerchantNicknameCell
                      merchantId={expense.merchant.id}
                      name={expense.merchant.name}
                      nickname={expense.merchant.nickname}
                    />
                  </td>
                  <td>
                    <ExpenseCategoryCell
                      expenseId={expense.id}
                      currentCategoryId={expense.categoryId}
                      currentCategoryName={expense.category.name}
                      currentCategorySymbol={expense.category.symbol}
                      currentCategoryColor={expense.category.color}
                      categories={categories}
                    />
                  </td>
                  <td className="muted">
                    {expense.installmentCurrent != null && expense.installmentTotal != null
                      ? `${expense.installmentCurrent}/${expense.installmentTotal}`
                      : "—"}
                  </td>
                  <td className="col-right">{formatCents(expense.amountCents)}</td>
                  <td>
                    <ExpenseIgnoreToggle
                      expenseId={expense.id}
                      ignored={expense.ignored}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pagination">
          <span className="muted">
            Página {page} de {totalPages} ({totalExpenses} lançamentos)
          </span>
          <div className="inline">
            <PageSizeSelect value={pageSize} />
            <PaginationControl currentPage={page} totalPages={totalPages} />
          </div>
        </div>
      </section>
    </div>
  );
}
