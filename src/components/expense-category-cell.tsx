"use client";

import { useState, useTransition } from "react";
import { updateExpenseCategoryAction } from "@/app/actions";
import { CategoryIcon } from "@/components/category-icon";

type CategoryOption = {
  id: string;
  name: string;
  color: string;
  symbol: string;
};

type Props = {
  expenseId: string;
  currentCategoryId: string;
  currentCategoryName: string;
  currentCategorySymbol: string;
  currentCategoryColor: string;
  categories: CategoryOption[];
};

export function ExpenseCategoryCell({
  expenseId,
  currentCategoryId,
  currentCategoryName,
  currentCategorySymbol,
  currentCategoryColor,
  categories,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [optimistic, setOptimistic] = useState({
    id: currentCategoryId,
    name: currentCategoryName,
    symbol: currentCategorySymbol,
    color: currentCategoryColor,
  });
  const [, startTransition] = useTransition();

  if (!editing) {
    return (
      <button
        type="button"
        className="category-pill"
        style={{
          backgroundColor: `${optimistic.color}22`,
          color: optimistic.color,
          border: `1px solid ${optimistic.color}55`,
          cursor: "pointer",
        }}
        onClick={() => setEditing(true)}
        title="Clique para alterar categoria"
      >
        <CategoryIcon icon={optimistic.symbol} color={optimistic.color} size={14} />
        {optimistic.name}
      </button>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = categories.find((c) => c.id === e.target.value);
    if (!selected || selected.id === optimistic.id) {
      setEditing(false);
      return;
    }

    setOptimistic({ id: selected.id, name: selected.name, symbol: selected.symbol, color: selected.color });
    setEditing(false);

    const formData = new FormData();
    formData.set("expenseId", expenseId);
    formData.set("categoryId", selected.id);

    startTransition(() => updateExpenseCategoryAction(formData));
  }

  return (
    <select
      name="categoryId"
      defaultValue={optimistic.id}
      onChange={handleChange}
      onBlur={() => setEditing(false)}
      autoFocus
    >
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}
