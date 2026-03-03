import { formatCents } from "@/lib/money";

type CategoryData = {
  name: string;
  spentCents: number;
  limitCents: number | null;
};

type Props = {
  data: CategoryData[];
};

export function CategorySpendChart({ data }: Props) {
  if (data.length === 0) {
    return null;
  }

  const rows = data.map((item) => {
    const limitCents = item.limitCents ?? 0;
    const ratio = limitCents > 0 ? item.spentCents / limitCents : 0;
    const percent = limitCents > 0 ? Math.round(ratio * 100) : 0;

    return {
      ...item,
      limitCents,
      percent,
      progressWidth: `${Math.min(100, Math.max(0, percent))}%`,
      isOverLimit: limitCents > 0 && item.spentCents > limitCents,
    };
  });

  const totalLimitCents = rows.reduce((acc, row) => acc + row.limitCents, 0);
  const totalSpentCents = rows.reduce((acc, row) => acc + row.spentCents, 0);
  const totalPercent = totalLimitCents > 0 ? Math.round((totalSpentCents / totalLimitCents) * 100) : 0;
  const donutPercent = Math.min(100, Math.max(0, totalPercent));

  return (
    <div className="category-analytics">
      <div className="category-lines-card">
        <h4>Despesas: realizado vs planejado</h4>
        <div className="category-lines">
          {rows.map((row) => (
            <div key={row.name} className="category-line-row">
              <div className="category-line-name">{row.name}</div>

              <div className="category-line-progress">
                <div className="category-line-track" aria-hidden="true">
                  <div
                    className={`category-line-fill ${row.isOverLimit ? "category-line-over" : ""}`}
                    style={{ width: row.progressWidth }}
                  />
                </div>
                <span className={row.isOverLimit ? "warn category-line-percent" : "muted category-line-percent"}>
                  {row.limitCents > 0 ? `${row.percent}%` : "-"}
                </span>
              </div>

              <div className="category-line-value">
                {row.limitCents > 0 ? formatCents(row.spentCents) : "Sem limite"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="category-donut-card">
        <h4>Grau de compromisso</h4>
        <div
          className="category-donut"
          style={{ background: `conic-gradient(#d86f33 ${donutPercent}%, #dfe6ef 0)` }}
          role="img"
          aria-label={`Comprometimento total de ${totalPercent}%`}
        >
          <div className="category-donut-inner">
            <strong>{totalPercent}%</strong>
            <span className="muted">utilizado</span>
          </div>
        </div>

        <p className="muted">
          Gasto total: <b>{formatCents(totalSpentCents)}</b>
        </p>
        <p className="muted">
          Limite total: <b>{totalLimitCents > 0 ? formatCents(totalLimitCents) : "Não definido"}</b>
        </p>
      </div>
    </div>
  );
}
