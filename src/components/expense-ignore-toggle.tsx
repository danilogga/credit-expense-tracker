"use client";

import { toggleExpenseIgnoredAction } from "@/app/actions";

type Props = {
  expenseId: string;
  ignored: boolean;
};

export function ExpenseIgnoreToggle({ expenseId, ignored }: Props) {
  return (
    <form action={toggleExpenseIgnoredAction} style={{ display: "contents" }}>
      <input type="hidden" name="id" value={expenseId} />
      <button
        type="submit"
        className="btn-icon expense-ignore-btn"
        title={ignored ? "Incluir no monitoramento" : "Ignorar no monitoramento"}
        style={{ color: ignored ? "#d97706" : "var(--muted)" }}
      >
        {ignored ? (
          <svg width="16" height="16" viewBox="0 0 256 256" aria-hidden="true">
            <path fill="currentColor" d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm40,112H88a8,8,0,0,1,0-16h80a8,8,0,0,1,0,16Z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 256 256" aria-hidden="true">
            <path fill="currentColor" d="M176,128a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,128Zm56,0A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
          </svg>
        )}
      </button>
    </form>
  );
}
