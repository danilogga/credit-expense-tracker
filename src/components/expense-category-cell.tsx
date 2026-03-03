"use client";

import { useRef, useState } from "react";
import { updateExpenseCategoryAction } from "@/app/actions";
import { CategoryIcon } from "@/components/category-icon";

function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? "#1a1a1a" : "#ffffff";
}

type CategoryOption = {
  id: string;
  name: string;
};

type Props = {
  expenseId: string;
  currentCategoryId: string;
  currentCategoryName: string;
  currentCategorySymbol: string;
  currentCategoryColor: string;
  month: string;
  page: number;
  categories: CategoryOption[];
};

export function ExpenseCategoryCell({
  expenseId,
  currentCategoryId,
  currentCategoryName,
  currentCategorySymbol,
  currentCategoryColor,
  month,
  page,
  categories,
}: Props) {
  const [editing, setEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!editing) {
    const fg = contrastColor(currentCategoryColor);
    return (
      <button
        type="button"
        className="category-pill"
        style={{ backgroundColor: currentCategoryColor, color: fg, border: "none", cursor: "pointer" }}
        onClick={() => setEditing(true)}
        title="Clique para alterar categoria"
      >
        <CategoryIcon icon={currentCategorySymbol} color={fg} size={14} />
        {currentCategoryName}
      </button>
    );
  }

  return (
    <form ref={formRef} action={updateExpenseCategoryAction} className="inline">
      <input type="hidden" name="expenseId" value={expenseId} />
      <input type="hidden" name="month" value={month} />
      <input type="hidden" name="page" value={String(page)} />
      <select
        name="categoryId"
        defaultValue={currentCategoryId}
        onChange={() => formRef.current?.requestSubmit()}
        onBlur={() => setEditing(false)}
        autoFocus
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </form>
  );
}
