export function parseMoneyToCents(input: string): number {
  const cleaned = input.replace(/\s/g, "").replace(/R\$/gi, "").trim();

  if (!cleaned) {
    throw new Error("Valor vazio");
  }

  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;

  const value = Number(normalized);
  if (!Number.isFinite(value)) {
    throw new Error(`Valor inválido: ${input}`);
  }

  return Math.round(value * 100);
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}
