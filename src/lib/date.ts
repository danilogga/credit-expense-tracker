import { parse, isValid } from "date-fns";

const DATE_PATTERNS = ["yyyy-MM-dd", "dd/MM/yyyy", "dd-MM-yyyy", "MM/dd/yyyy"];

export function parseCsvDate(input: string): Date {
  const value = input.trim();

  for (const pattern of DATE_PATTERNS) {
    const parsed = parse(value, pattern, new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }

  const fallback = new Date(value);
  if (!isValid(fallback)) {
    throw new Error(`Data inválida: ${input}`);
  }

  return fallback;
}

export function toMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function currentMonthKey(): string {
  return toMonthKey(new Date());
}

export function resolveMonthKey(input: {
  month?: string;
  year?: string;
  monthNumber?: string;
}): string {
  if (input.month && /^\d{4}-\d{2}$/.test(input.month)) {
    return input.month;
  }

  const year = Number(input.year);
  const monthNumber = Number(input.monthNumber);
  if (Number.isInteger(year) && Number.isInteger(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
    return `${year}-${String(monthNumber).padStart(2, "0")}`;
  }

  return currentMonthKey();
}
