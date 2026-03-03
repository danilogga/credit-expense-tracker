import {
  removeClosingOverrideAction,
  setClosingOverrideAction,
  setDefaultClosingDayAction,
} from "@/app/actions";
import { MonthYearSelect } from "@/components/month-year-select";
import { QueryToast } from "@/components/query-toast";
import { resolveMonthKey, toMonthKey } from "@/lib/date";
import {
  computeInvoiceMonth,
  ensureDefaults,
  getBillingConfigForMonth,
  listClosingOverrides,
} from "@/lib/domain";
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

  const [billingConfig, overrides] = await Promise.all([
    getBillingConfigForMonth(month),
    listClosingOverrides(12),
  ]);

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
      <section className="panel">
        <h2>Configuração da Fatura</h2>
        <form className="inline" method="get">
          <MonthYearSelect key={`billing-filter-${month}`} monthKey={month} idPrefix="billing-filter" />
          <button type="submit">Ver mês</button>
        </form>

      </section>

      <section className="panel grid">
        <div>
          <h3>Dia de virada da fatura</h3>
          <p className="muted">
            Dia efetivo para <b>{month}</b>: <b>{billingConfig.effectiveClosingDay}</b>{" "}
            {billingConfig.isOverride ? "(exceção mensal)" : "(padrão)"}
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
            <button type="submit">Salvar padrão</button>
          </form>

          <form className="inline" action={setClosingOverrideAction}>
            <span>Exceção do mês:</span>
            <MonthYearSelect
              key={`override-${month}`}
              monthKey={month}
              idPrefix="override"
              monthName="overrideMonthNumber"
              yearName="overrideYear"
            />
            <input name="closingDay" type="number" min={1} max={31} placeholder="Dia" required />
            <button type="submit">Salvar exceção</button>
          </form>
        </div>

        <div>
          <h3>Exceções cadastradas</h3>
          <table>
            <thead>
              <tr>
                <th>Mês</th>
                <th>Dia</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {overrides.length === 0 ? (
                <tr>
                  <td colSpan={3}>Sem exceções cadastradas.</td>
                </tr>
              ) : (
                overrides.map((item) => (
                  <tr key={item.id}>
                    <td>{item.month}</td>
                    <td>{item.closingDay}</td>
                    <td>
                      <form action={removeClosingOverrideAction}>
                        <input type="hidden" name="month" value={item.month} />
                        <button type="submit">Remover</button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
