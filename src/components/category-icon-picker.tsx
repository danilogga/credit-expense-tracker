"use client";

import { useMemo, useState } from "react";
import { ICON_GROUPS, PHOSPHOR_ICON_MAP, PHOSPHOR_ICON_NAMES } from "@/lib/icons";
import { normalizeCategoryIcon } from "@/lib/constants";
import { CategoryIcon } from "@/components/category-icon";

type Props = {
  name?: string;
  selected?: string;
};

export function CategoryIconPicker({ name = "symbol", selected = "phosphor:circle" }: Props) {
  const [query, setQuery] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(normalizeCategoryIcon(selected));

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_GROUPS;
    const matching = PHOSPHOR_ICON_NAMES.filter((n) => n.includes(q));
    if (!matching.length) return [];
    return [{ label: "Resultados", icons: matching }];
  }, [query]);

  const selectedName = selectedIcon.startsWith("phosphor:") ? selectedIcon.slice(9) : selectedIcon;

  return (
    <div className="icon-picker-wrap">
      <input type="hidden" name={name} value={selectedIcon} />

      <label htmlFor="icon-search">Buscar ícone</label>
      <input
        id="icon-search"
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        placeholder="Ex: car, coffee, house, heart…"
      />

      <div className="icon-picker-preview muted">
        Selecionado:{" "}
        <CategoryIcon icon={selectedIcon} size={16} />{" "}
        {selectedName}
      </div>

      <div className="icon-picker-scroll">
        {filteredGroups.length === 0 && (
          <p className="muted">Nenhum ícone encontrado.</p>
        )}
        {filteredGroups.map((group) => (
          <div key={group.label} className="icon-picker-group">
            <p className="icon-picker-group-label">{group.label}</p>
            <div className="icon-picker-grid">
              {group.icons.map((iconName) => {
                const fullName = `phosphor:${iconName}`;
                const checked = selectedIcon === fullName;
                const IconComp = PHOSPHOR_ICON_MAP[iconName];
                if (!IconComp) return null;
                return (
                  <button
                    key={iconName}
                    type="button"
                    className={`icon-picker-btn${checked ? " icon-picker-btn-active" : ""}`}
                    onClick={() => setSelectedIcon(fullName)}
                    title={iconName}
                  >
                    <IconComp size={22} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
