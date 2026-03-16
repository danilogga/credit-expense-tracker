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

    const isWarning = limitCents > 0 && percent >= 70 && percent < 90;
    const isOverLimit = limitCents > 0 && percent >= 90;

    return {
      ...item,
      limitCents,
      percent,
      progressWidth: `${Math.min(100, Math.max(0, percent))}%`,
      isWarning,
      isOverLimit,
    };
  });

  const totalLimitCents = rows.reduce((acc, row) => acc + row.limitCents, 0);
  const totalSpentCents = rows.reduce((acc, row) => acc + row.spentCents, 0);
  const totalPercent = totalLimitCents > 0 ? Math.round((totalSpentCents / totalLimitCents) * 100) : 0;
  const donutPercent = Math.min(100, Math.max(0, totalPercent));
  const donutColor = totalPercent >= 90 ? "#e05555" : totalPercent >= 70 ? "#f5a623" : "#4db885";

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
                    className={`category-line-fill ${row.isOverLimit ? "category-line-over" : row.isWarning ? "category-line-warn" : ""}`}
                    style={{ width: row.progressWidth }}
                  />
                </div>
                <span className={row.isOverLimit ? "warn category-line-percent" : row.isWarning ? "category-line-percent category-line-percent-warn" : "muted category-line-percent"}>
                  {row.limitCents > 0 ? `${row.percent}%` : "-"}
                </span>
              </div>

              <div className="category-line-value">
                {formatCents(row.spentCents)}
              </div>

              <div className="category-line-limit muted">
                {row.limitCents > 0 ? formatCents(row.limitCents) : "Sem limite"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="category-donut-card">
        <h4>Grau de compromisso</h4>
        <div
          className="category-donut"
          style={{ background: `conic-gradient(${donutColor} ${donutPercent}%, #dfe6ef 0)` }}
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
