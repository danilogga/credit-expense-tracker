"use client";

import { useRef, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";
import "react-datepicker/dist/react-datepicker.css";
import { updateExpenseInvoiceMonthAction } from "@/app/actions";

registerLocale("pt-BR", ptBR);

type Props = {
  expenseId: string;
  invoiceMonth: string;
  currentPageMonth: string;
  page: number;
};

export function ExpenseInvoiceMonthCell({ expenseId, invoiceMonth, currentPageMonth, page }: Props) {
  const [editing, setEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [year, mon] = invoiceMonth.split("-").map(Number);
  const formatted = `${String(mon).padStart(2, "0")}/${year}`;

  function handleChange(date: Date | null) {
    if (!date) return;
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const input = formRef.current?.querySelector<HTMLInputElement>('input[name="invoiceMonth"]');
    if (input) {
      input.value = newMonth;
      formRef.current?.requestSubmit();
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        className="tag"
        style={{ cursor: "pointer", fontVariantNumeric: "tabular-nums" }}
        onClick={() => setEditing(true)}
        title="Clique para alterar mês de referência"
      >
        {formatted}
      </button>
    );
  }

  return (
    <form ref={formRef} action={updateExpenseInvoiceMonthAction} className="inline">
      <input type="hidden" name="expenseId" value={expenseId} />
      <input type="hidden" name="month" value={currentPageMonth} />
      <input type="hidden" name="page" value={String(page)} />
      <input type="hidden" name="invoiceMonth" defaultValue={invoiceMonth} />
      <DatePicker
        selected={new Date(year, mon - 1, 1)}
        onChange={handleChange}
        onClickOutside={() => setEditing(false)}
        dateFormat="MM/yyyy"
        showMonthYearPicker
        locale="pt-BR"
        autoFocus
        open
        inline
      />
    </form>
  );
}
