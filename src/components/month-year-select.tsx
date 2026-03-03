const MONTHS = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

type Props = {
  monthKey: string;
  monthName?: string;
  yearName?: string;
  idPrefix?: string;
};

export function MonthYearSelect({
  monthKey,
  monthName = "filterMonth",
  yearName = "filterYear",
  idPrefix = "filter",
}: Props) {
  const [year, month] = monthKey.split("-").map(Number);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 9 }, (_, i) => currentYear + 4 - i);

  return (
    <div className="month-year-select">
      <label htmlFor={`${idPrefix}-month`}>Mês:</label>
      <select id={`${idPrefix}-month`} name={monthName} defaultValue={String(month)}>
        {MONTHS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <label htmlFor={`${idPrefix}-year`}>Ano:</label>
      <select id={`${idPrefix}-year`} name={yearName} defaultValue={String(year)}>
        {years.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
