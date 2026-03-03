import { addMonths } from "date-fns";
import { parse as parseCsv } from "csv-parse/sync";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES, DEFAULT_CATEGORY_NAME } from "@/lib/constants";
import { parseCsvDate, toMonthKey } from "@/lib/date";
import { parseMoneyToCents } from "@/lib/money";
import { normalizeEstablishment } from "@/lib/normalize";

type CsvRow = {
  data?: string;
  estabelecimento?: string;
  valor?: string;
};

type BillingConfig = {
  defaultClosingDay: number;
  effectiveClosingDay: number;
  isOverride: boolean;
};

function supportsBillingConfig(): boolean {
  const client = prisma as unknown as {
    billingSettings?: unknown;
    billingClosingOverride?: unknown;
  };

  return Boolean(client.billingSettings && client.billingClosingOverride);
}

function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/^\uFEFF/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function canonicalHeader(header: string): string {
  const normalized = normalizeHeader(header);

  if (normalized === "data") {
    return "data";
  }

  if (normalized === "estabelecimento" || normalized === "lancamento" || normalized === "lançamento") {
    return "estabelecimento";
  }

  if (normalized === "valor") {
    return "valor";
  }

  return normalized;
}

function clampClosingDay(day: number, month: string): number {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return Math.max(1, Math.min(day, lastDay));
}

export async function ensureDefaults(): Promise<{ defaultCategoryId: string }> {
  await prisma.$transaction(
    DEFAULT_CATEGORIES.map((category) =>
      prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: {
          name: category.name,
          color: category.color,
          symbol: category.symbol,
        },
      }),
    ),
  );

  if (supportsBillingConfig()) {
    const client = prisma as unknown as {
      billingSettings: {
        upsert: (args: {
          where: { id: number };
          update: Record<string, never>;
          create: { id: number; defaultClosingDay: number };
        }) => Promise<unknown>;
      };
    };

    await client.billingSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        defaultClosingDay: 31,
      },
    });
  }

  const defaultCategory = await prisma.category.findUnique({
    where: { name: DEFAULT_CATEGORY_NAME },
    select: { id: true },
  });

  if (!defaultCategory) {
    throw new Error("Categoria padrão não encontrada");
  }

  return { defaultCategoryId: defaultCategory.id };
}

function fingerprint(input: { date: Date; normalizedName: string; amountCents: number }): string {
  return [
    input.date.toISOString().slice(0, 10),
    input.normalizedName,
    String(input.amountCents),
  ].join("|");
}

export async function getBillingConfigForMonth(month: string): Promise<BillingConfig> {
  await ensureDefaults();

  if (!supportsBillingConfig()) {
    return {
      defaultClosingDay: 31,
      effectiveClosingDay: clampClosingDay(31, month),
      isOverride: false,
    };
  }

  const client = prisma as unknown as {
    billingSettings: {
      findUnique: (args: { where: { id: number } }) => Promise<{ defaultClosingDay: number } | null>;
      update: (args: { where: { id: number }; data: { defaultClosingDay: number } }) => Promise<unknown>;
    };
    billingClosingOverride: {
      findUnique: (args: { where: { month: string } }) => Promise<{ closingDay: number } | null>;
      findMany: (args: { orderBy: { month: "asc" | "desc" }; take: number }) => Promise<Array<{
        id: string;
        month: string;
        closingDay: number;
      }>>;
      upsert: (args: {
        where: { month: string };
        update: { closingDay: number };
        create: { month: string; closingDay: number };
      }) => Promise<unknown>;
      deleteMany: (args: { where: { month: string } }) => Promise<unknown>;
    };
  };

  const [settings, override] = await Promise.all([
    client.billingSettings.findUnique({ where: { id: 1 } }),
    client.billingClosingOverride.findUnique({ where: { month } }),
  ]);

  const defaultClosingDay = settings?.defaultClosingDay ?? 31;
  const configuredDay = override?.closingDay ?? defaultClosingDay;

  return {
    defaultClosingDay,
    effectiveClosingDay: clampClosingDay(configuredDay, month),
    isOverride: Boolean(override),
  };
}

export async function computeInvoiceMonth(expenseDate: Date): Promise<string> {
  const expenseMonth = toMonthKey(expenseDate);
  const { effectiveClosingDay } = await getBillingConfigForMonth(expenseMonth);
  const expenseDay = expenseDate.getDate();

  const monthsToAdd = expenseDay <= effectiveClosingDay ? 1 : 2;
  return toMonthKey(addMonths(expenseDate, monthsToAdd));
}

export async function importCsvContent(csvContent: string): Promise<{
  imported: number;
  duplicates: number;
  invalidRows: number;
}> {
  const { defaultCategoryId } = await ensureDefaults();

  const rows = parseCsv(csvContent, {
    columns: (headers) => headers.map(canonicalHeader),
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];

  let imported = 0;
  let duplicates = 0;
  let invalidRows = 0;

  for (const row of rows) {
    try {
      if (!row.data || !row.valor || !row.estabelecimento) {
        invalidRows += 1;
        continue;
      }

      const date = parseCsvDate(row.data);
      const establishmentRaw = row.estabelecimento.trim();
      const amountCents = parseMoneyToCents(row.valor);

      if (!establishmentRaw) {
        invalidRows += 1;
        continue;
      }

      const normalizedName = normalizeEstablishment(establishmentRaw);

      let merchant = await prisma.merchant.findUnique({
        where: { normalizedName },
        select: { id: true, categoryId: true },
      });

      if (!merchant) {
        merchant = await prisma.merchant.create({
          data: {
            name: establishmentRaw,
            normalizedName,
            categoryId: defaultCategoryId,
          },
          select: { id: true, categoryId: true },
        });
      }

      const rowFingerprint = fingerprint({ date, normalizedName, amountCents });
      const invoiceMonth = await computeInvoiceMonth(date);

      const created = await prisma.expense.createMany({
        data: {
          expenseDate: date,
          invoiceMonth,
          amountCents,
          establishmentRaw,
          merchantId: merchant.id,
          categoryId: merchant.categoryId,
          fingerprint: rowFingerprint,
        },
        skipDuplicates: true,
      });

      if (created.count === 0) {
        duplicates += 1;
      } else {
        imported += 1;
      }
    } catch {
      invalidRows += 1;
    }
  }

  return { imported, duplicates, invalidRows };
}

export async function setMerchantCategory(merchantId: string, categoryId: string): Promise<void> {
  await prisma.$transaction([
    prisma.merchant.update({
      where: { id: merchantId },
      data: { categoryId },
    }),
    prisma.expense.updateMany({
      where: { merchantId },
      data: { categoryId },
    }),
  ]);
}

export async function updateMerchantNickname(merchantId: string, nickname: string): Promise<void> {
  await prisma.merchant.update({
    where: { id: merchantId },
    data: { nickname: nickname.trim() || null },
  });
}

export async function setMonthlyBudget(month: string, amountCents: number): Promise<void> {
  await prisma.monthlyBudget.upsert({
    where: { month },
    update: { amountCents },
    create: { month, amountCents },
  });
}

export async function setDefaultClosingDay(day: number): Promise<void> {
  await ensureDefaults();
  if (!supportsBillingConfig()) {
    return;
  }

  const client = prisma as unknown as {
    billingSettings: {
      update: (args: { where: { id: number }; data: { defaultClosingDay: number } }) => Promise<unknown>;
    };
  };

  await client.billingSettings.update({
    where: { id: 1 },
    data: { defaultClosingDay: Math.max(1, Math.min(day, 31)) },
  });
}

export async function setClosingOverride(month: string, day: number): Promise<void> {
  await ensureDefaults();
  if (!supportsBillingConfig()) {
    return;
  }

  const client = prisma as unknown as {
    billingClosingOverride: {
      upsert: (args: {
        where: { month: string };
        update: { closingDay: number };
        create: { month: string; closingDay: number };
      }) => Promise<unknown>;
    };
  };

  await client.billingClosingOverride.upsert({
    where: { month },
    update: { closingDay: Math.max(1, Math.min(day, 31)) },
    create: {
      month,
      closingDay: Math.max(1, Math.min(day, 31)),
    },
  });
}

export async function removeClosingOverride(month: string): Promise<void> {
  if (!supportsBillingConfig()) {
    return;
  }

  const client = prisma as unknown as {
    billingClosingOverride: {
      deleteMany: (args: { where: { month: string } }) => Promise<unknown>;
    };
  };

  await client.billingClosingOverride.deleteMany({ where: { month } });
}

export async function recalculateAllInvoiceMonths(): Promise<number> {
  const expenses = await prisma.expense.findMany({
    select: { id: true, expenseDate: true },
  });

  for (const expense of expenses) {
    const invoiceMonth = await computeInvoiceMonth(expense.expenseDate);
    await prisma.expense.update({
      where: { id: expense.id },
      data: { invoiceMonth },
    });
  }

  return expenses.length;
}

export async function dashboardForMonth(month: string) {
  const [budget, expenses, categories] = await Promise.all([
    prisma.monthlyBudget.findUnique({ where: { month } }),
    prisma.expense.findMany({
      where: { invoiceMonth: month },
      select: { amountCents: true, categoryId: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalSpentCents = expenses.reduce((acc, item) => acc + item.amountCents, 0);
  const byCategory = categories
    .map((category) => {
      const spentCents = expenses
        .filter((expense) => expense.categoryId === category.id)
        .reduce((acc, expense) => acc + expense.amountCents, 0);

      return {
        id: category.id,
        name: category.name,
        limitCents: category.limitCents,
        spentCents,
      };
    })
    .filter((item) => item.spentCents > 0 || item.limitCents !== null);

  return {
    month,
    monthlyBudgetCents: budget?.amountCents ?? null,
    totalSpentCents,
    byCategory,
  };
}

export function inferMonthFromDate(date: Date): string {
  return toMonthKey(date);
}

export async function listClosingOverrides(limit = 12): Promise<
  Array<{ id: string; month: string; closingDay: number }>
> {
  if (!supportsBillingConfig()) {
    return [];
  }

  const client = prisma as unknown as {
    billingClosingOverride: {
      findMany: (args: { orderBy: { month: "asc" | "desc" }; take: number }) => Promise<Array<{
        id: string;
        month: string;
        closingDay: number;
      }>>;
    };
  };

  return client.billingClosingOverride.findMany({
    orderBy: { month: "desc" },
    take: limit,
  });
}
