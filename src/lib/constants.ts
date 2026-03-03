export const DEFAULT_CATEGORIES = [
  { name: "Outros", color: "#8A94A6", symbol: "phosphor:circle" },
  { name: "Alimentação", color: "#D86F33", symbol: "phosphor:fork-knife" },
  { name: "Transporte", color: "#3B82F6", symbol: "phosphor:car" },
  { name: "Moradia", color: "#7C3AED", symbol: "phosphor:house" },
  { name: "Saúde", color: "#DC2626", symbol: "phosphor:heartbeat" },
  { name: "Lazer", color: "#EAB308", symbol: "phosphor:star" },
  { name: "Educação", color: "#14B8A6", symbol: "phosphor:book-open" },
  { name: "Assinaturas", color: "#4F46E5", symbol: "phosphor:receipt" },
];

export const DEFAULT_CATEGORY_NAME = "Outros";
export const DEFAULT_CATEGORY_ICON = "phosphor:circle";

export function normalizeCategoryIcon(icon: string): string {
  if (icon.startsWith("phosphor:") && icon.length > 9) return icon;
  return DEFAULT_CATEGORY_ICON;
}
