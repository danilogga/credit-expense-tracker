import { setDefaultClosingDayAction } from "@/app/actions";
import { MonthYearSelect } from "@/components/month-year-select";
import { QueryToast } from "@/components/query-toast";
import { resolveMonthKey, toMonthKey } from "@/lib/date";
import { computeInvoiceMonth, ensureDefaults, getBillingConfigForMonth } from "@/lib/domain";
import { InvoiceMonthMemory } from "@/components/invoice-month-memory";

type SearchParams = Promise<{
  month?: string;
  filterMonth?: string;
  filterYear?: string;
  ok?: string;
  error?: string;
  simulateDate?: string;
}>;

export default async function BillingPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const month = resolveMonthKey({
    month: params.month,
    monthNumber: params.filterMonth,
    year: params.filterYear,
  });
  const hasExplicitMonth = Boolean(params.month || params.filterMonth || params.filterYear);
  const simulateDate = params.simulateDate ?? "";

  await ensureDefaults();

  const billingConfig = await getBillingConfigForMonth(month);

  let simulatedInvoiceMonth: string | null = null;
  let simulatedEffectiveClosingDay: number | null = null;

  if (simulateDate) {
    const simulatedDate = new Date(`${simulateDate}T12:00:00`);
    if (!Number.isNaN(simulatedDate.getTime())) {
      const purchaseMonth = toMonthKey(simulatedDate);
      const purchaseConfig = await getBillingConfigForMonth(purchaseMonth);
      simulatedEffectiveClosingDay = purchaseConfig.effectiveClosingDay;
      simulatedInvoiceMonth = await computeInvoiceMonth(simulatedDate);
    }
  }

  return (
    <div>
      <InvoiceMonthMemory currentMonth={month} hasExplicitMonth={hasExplicitMonth} />
      <QueryToast successMessage={params.ok} errorMessage={params.error} />
      <div className="page-header">
        <div>
          <h1>Configuração da Fatura</h1>
          <p className="muted">Dia de virada padrão da fatura</p>
        </div>
        <form className="inline" method="get">
          <MonthYearSelect key={`billing-filter-${month}`} monthKey={month} idPrefix="billing-filter" />
          <button type="submit">Ver mês</button>
        </form>
      </div>

      <section className="panel">
        <h3>Dia de virada da fatura</h3>
        <p className="muted">
          Dia de fechamento padrão: <b>{billingConfig.defaultClosingDay}</b>
        </p>

        <form className="inline" action={setDefaultClosingDayAction}>
          <input type="hidden" name="month" value={month} />
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

      <section className="panel">
        <h3>Simular fatura de uma compra</h3>
        <form className="inline" method="get">
          <input type="hidden" name="month" value={month} />
          <label htmlFor="simulateDate">Data da compra:</label>
          <input
            id="simulateDate"
            name="simulateDate"
            type="date"
            defaultValue={simulateDate}
            required
          />
          <button type="submit">Simular</button>
        </form>

        {simulatedInvoiceMonth ? (
          <p className="tag">
            Compra em {new Date(`${simulateDate}T12:00:00`).toLocaleDateString("pt-BR")} cai na fatura{" "}
            <b>{simulatedInvoiceMonth}</b> (virada aplicada no mês da compra: dia{" "}
            {simulatedEffectiveClosingDay}).
          </p>
        ) : null}
      </section>
    </div>
  );
}
