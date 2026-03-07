import { resolveMonthKey } from "@/lib/date";
import { MonthYearSelect } from "@/components/month-year-select";
import { PaginationControl } from "@/components/pagination-control";
import { InvoiceMonthMemory } from "@/components/invoice-month-memory";
import { CategorySpendChart } from "@/components/category-spend-chart";
import { CategoryIcon } from "@/components/category-icon";
import { ExpenseCategoryCell } from "@/components/expense-category-cell";
import { AutoSubmitForm } from "@/components/auto-submit-form";
import { ExpenseInvoiceMonthCell } from "@/components/expense-invoice-month-cell";
import { QueryToast } from "@/components/query-toast";
import { dashboardForMonth, ensureDefaults } from "@/lib/domain";
import { formatCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";

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
  categoryId?: string;
  ok?: string;
  error?: string;
}>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const month = resolveMonthKey({
    month: params.month,
    monthNumber: params.filterMonth,
    year: params.filterYear,
  });
  const hasExplicitMonth = Boolean(params.month || params.filterMonth || params.filterYear);
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const categoryId = params.categoryId ?? null;
  const pageSize = 15;
  const skip = (page - 1) * pageSize;

  await ensureDefaults();

  const expenseWhere = {
    invoiceMonth: month,
    ...(categoryId ? { categoryId } : {}),
  };

  const [dashboard, totalExpenses, expenses, categories] = await Promise.all([
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
  ]);

  const spent = dashboard.totalSpentCents;
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
        <AutoSubmitForm className="inline" method="get">
          <MonthYearSelect key={`dashboard-filter-${month}`} monthKey={month} idPrefix="dashboard-filter" />
        </AutoSubmitForm>
      </div>

      <section className="panel stats">
        <div className="stat">
          <span className="muted">Total gasto (fatura)</span>
          <b>{formatCents(spent)}</b>
        </div>
      </section>

      <section className="panel">
        <h3>Gasto por categoria</h3>
        <CategorySpendChart data={dashboard.byCategory} />
      </section>

      <section className="panel">
        <h3>Despesas da fatura</h3>

        <div className="category-filter-bar">
          <a
            href={`/?month=${month}`}
            className={categoryId ? "category-filter-all" : "category-filter-all category-filter-all-active"}
          >
            Todas
          </a>
          {categories.map((cat) => {
            const active = categoryId === cat.id;
            const fg = contrastColor(cat.color);
            return (
              <a
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
              </a>
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
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6}>Sem despesas para esta fatura.</td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id}>
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
                    {expense.merchant.nickname ? (
                      <span data-tooltip={expense.merchant.name} data-tooltip-pos="top">
                        {expense.merchant.nickname}
                      </span>
                    ) : (
                      expense.merchant.name
                    )}
                  </td>
                  <td>
                    <ExpenseCategoryCell
                      expenseId={expense.id}
                      currentCategoryId={expense.categoryId}
                      currentCategoryName={expense.category.name}
                      currentCategorySymbol={expense.category.symbol}
                      currentCategoryColor={expense.category.color}
                      month={month}
                      page={page}
                      categories={categories}
                    />
                  </td>
                  <td className="muted">
                    {expense.installmentCurrent != null && expense.installmentTotal != null
                      ? `${expense.installmentCurrent}/${expense.installmentTotal}`
                      : "—"}
                  </td>
                  <td className="col-right">{formatCents(expense.amountCents)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pagination">
          <span className="muted">
            Página {page} de {totalPages} ({totalExpenses} lançamentos)
          </span>
          <PaginationControl currentPage={page} totalPages={totalPages} />
        </div>
      </section>
    </div>
  );
}
