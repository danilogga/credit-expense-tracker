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

  const [monthTotals, closedMonths, billingConfig] = await Promise.all([
    prisma.expense.groupBy({
      by: ["invoiceMonth"],
      _sum: { amountCents: true },
      orderBy: { invoiceMonth: "desc" },
    }),
    getClosedMonths(),
    getBillingConfigForMonth(currentMonthKey()),
  ]);

  const invoices = monthTotals.map((row) => ({
    month: row.invoiceMonth,
    totalCents: row._sum.amountCents ?? 0,
    closed: closedMonths.has(row.invoiceMonth),
  }));

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
              <th className="col-right">Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={4}>Nenhuma fatura encontrada.</td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.month}>
                  <td><b>{formatMonth(invoice.month)}</b></td>
                  <td className="col-right">{formatCents(invoice.totalCents)}</td>
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
