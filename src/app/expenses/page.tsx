import { resolveMonthKey } from "@/lib/date";
import { InvoiceMonthMemory } from "@/components/invoice-month-memory";
import { MonthYearSelect } from "@/components/month-year-select";
import { CategoryIcon } from "@/components/category-icon";
import { ensureDefaults } from "@/lib/domain";
import { formatCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";

function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? "#1a1a1a" : "#ffffff";
}

type SearchParams = Promise<{ month?: string; filterMonth?: string; filterYear?: string }>;

export default async function ExpensesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const month = resolveMonthKey({
    month: params.month,
    monthNumber: params.filterMonth,
    year: params.filterYear,
  });
  const hasExplicitMonth = Boolean(params.month || params.filterMonth || params.filterYear);

  await ensureDefaults();

  const expenses = await prisma.expense.findMany({
    where: {
      invoiceMonth: month,
    },
    include: {
      merchant: true,
      category: true,
    },
    orderBy: [{ expenseDate: "desc" }, { importedAt: "desc" }],
  });

  return (
    <div className="panel">
      <InvoiceMonthMemory currentMonth={month} hasExplicitMonth={hasExplicitMonth} />
      <h2>Despesas por fatura</h2>
      <form className="inline" method="get">
        <MonthYearSelect key={`expenses-filter-${month}`} monthKey={month} idPrefix="expenses-filter" />
        <button type="submit">Filtrar</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Data da compra</th>
            <th>Fatura</th>
            <th>Estabelecimento</th>
            <th>Categoria</th>
            <th className="col-right">Valor</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 ? (
            <tr>
              <td colSpan={5}>Sem despesas na fatura selecionada.</td>
            </tr>
          ) : (
            expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.expenseDate.toLocaleDateString("pt-BR")}</td>
                <td>{expense.invoiceMonth}</td>
                <td>{expense.merchant.nickname || expense.merchant.name}</td>
                <td>
                  <span
                    className="category-pill"
                    style={{ backgroundColor: expense.category.color, color: contrastColor(expense.category.color) }}
                  >
                    <CategoryIcon icon={expense.category.symbol} color={contrastColor(expense.category.color)} size={14} />
                    {expense.category.name}
                  </span>
                </td>
                <td className="col-right">{formatCents(expense.amountCents)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
