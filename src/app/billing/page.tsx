import { setDefaultClosingDayAction } from "@/app/actions";
import { QueryToast } from "@/components/query-toast";
import { currentMonthKey, toMonthKey } from "@/lib/date";
import { computeInvoiceMonth, ensureDefaults, getBillingConfigForMonth } from "@/lib/domain";

type SearchParams = Promise<{ ok?: string; error?: string; simulateDate?: string }>;

export default async function BillingPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const month = currentMonthKey();
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
      <QueryToast successMessage={params.ok} errorMessage={params.error} />
      <div className="page-header">
        <div>
          <h1>Configuração da Fatura</h1>
          <p className="muted">Dia de virada padrão da fatura</p>
        </div>
      </div>

      <section className="panel">
        <h3>Dia de virada da fatura</h3>
        <p className="muted">
          Dia de fechamento padrão: <b>{billingConfig.defaultClosingDay}</b>
        </p>

        <form className="inline" action={setDefaultClosingDayAction}>
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
