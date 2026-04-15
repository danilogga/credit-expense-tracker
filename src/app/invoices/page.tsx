import { Lock, LockOpen } from "@phosphor-icons/react/dist/ssr";
import { QueryToast } from "@/components/query-toast";
import { closeInvoiceAction, openInvoiceAction, setDefaultClosingDayAction } from "@/app/actions";
import { getClosedMonths, getBillingConfigForMonth } from "@/lib/domain";
import { currentMonthKey } from "@/lib/date";
import { formatCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{ ok?: string; error?: string }>;

export default async function InvoicesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const [monthTotals, ignoredTotals, closedMonths, billingConfig] = await Promise.all([
    prisma.expense.groupBy({
      by: ["invoiceMonth"],
      where: { ignored: false },
      _sum: { amountCents: true },
      orderBy: { invoiceMonth: "desc" },
    }),
    prisma.expense.groupBy({
      by: ["invoiceMonth"],
      where: { ignored: true },
      _sum: { amountCents: true },
    }),
    getClosedMonths(),
    getBillingConfigForMonth(currentMonthKey()),
  ]);

  const ignoredByMonth = new Map(
    ignoredTotals.map((row) => [row.invoiceMonth, row._sum.amountCents ?? 0]),
  );

  const invoices = monthTotals.map((row) => {
    const activeCents = row._sum.amountCents ?? 0;
    const ignoredCents = ignoredByMonth.get(row.invoiceMonth) ?? 0;
    return {
      month: row.invoiceMonth,
      activeCents,
      ignoredCents,
      totalCents: activeCents + ignoredCents,
      closed: closedMonths.has(row.invoiceMonth),
    };
  });

  function formatMonth(month: string) {
    const [year, m] = month.split("-");
    return `${m}/${year}`;
  }

  return (
    <div>
      <QueryToast successMessage={params.ok} errorMessage={params.error} />
      <div className="page-header">
        <div>
          <h1>Faturas</h1>
          <p className="muted">Gerencie o status de abertura e fechamento das faturas</p>
        </div>
      </div>

      <section className="panel">
        <h3>Dia de virada da fatura</h3>
        <p className="muted">
          Dia de fechamento padrão: <b>{billingConfig.defaultClosingDay}</b>
        </p>
        <form className="inline" action={setDefaultClosingDayAction}>
          <input type="hidden" name="returnTo" value="invoices" />
          <label htmlFor="defaultClosingDay">Dia padrão:</label>
          <input
            id="defaultClosingDay"
            name="defaultClosingDay"
            type="number"
            min={1}
            max={31}
            defaultValue={billingConfig.defaultClosingDay}
            required
          />
          <button type="submit">Salvar</button>
        </form>
      </section>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Mês de fatura</th>
              <th className="col-right">Total Mês</th>
              <th className="col-right">Ignorado</th>
              <th className="col-right">Total Fatura</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6}>Nenhuma fatura encontrada.</td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.month}>
                  <td><b>{formatMonth(invoice.month)}</b></td>
                  <td className="col-right">{formatCents(invoice.activeCents)}</td>
                  <td className="col-right">
                    {invoice.ignoredCents > 0 ? (
                      <span className="muted">{formatCents(invoice.ignoredCents)}</span>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td className="col-right"><b>{formatCents(invoice.totalCents)}</b></td>
                  <td>
                    {invoice.closed ? (
                      <span className="invoice-status invoice-status-closed">
                        <Lock size={13} weight="fill" />Fechada
                      </span>
                    ) : (
                      <span className="invoice-status invoice-status-open">
                        <LockOpen size={13} weight="fill" />Aberta
                      </span>
                    )}
                  </td>
                  <td>
                    {invoice.closed ? (
                      <form action={openInvoiceAction}>
                        <input type="hidden" name="month" value={invoice.month} />
                        <input type="hidden" name="returnTo" value="invoices" />
                        <button type="submit" className="invoice-open-btn">Reabrir</button>
                      </form>
                    ) : (
                      <form action={closeInvoiceAction}>
                        <input type="hidden" name="month" value={invoice.month} />
                        <input type="hidden" name="returnTo" value="invoices" />
                        <button type="submit" className="invoice-close-btn">Fechar</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
