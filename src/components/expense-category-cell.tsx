"use client";

import { useRef, useState } from "react";
import { updateExpenseCategoryAction } from "@/app/actions";
import { CategoryIcon } from "@/components/category-icon";

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
    return (
      <button
        type="button"
        className="category-pill"
        style={{
          backgroundColor: `${currentCategoryColor}22`,
          color: currentCategoryColor,
          border: `1px solid ${currentCategoryColor}55`,
          cursor: "pointer",
        }}
        onClick={() => setEditing(true)}
        title="Clique para alterar categoria"
      >
        <CategoryIcon icon={currentCategorySymbol} color={currentCategoryColor} size={14} />
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
