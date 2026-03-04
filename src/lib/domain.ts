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
};

function supportsBillingConfig(): boolean {
  const client = prisma as unknown as {
    billingSettings?: unknown;
  };

  return Boolean(client.billingSettings);
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

function parseInstallment(name: string): { cleanName: string; current: number; total: number } | null {
  const match = name.match(/^(.+?)(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;
  const current = parseInt(match[2], 10);
  const total = parseInt(match[3], 10);
  if (current < 1 || total < 1 || current > total) return null;
  return { cleanName: match[1].trimEnd(), current, total };
}

function fingerprint(input: { date: Date; normalizedName: string; amountCents: number; installmentCurrent?: number; installmentTotal?: number }): string {
  const parts = [
    input.date.toISOString().slice(0, 10),
    input.normalizedName,
    String(input.amountCents),
  ];
  if (input.installmentCurrent !== undefined && input.installmentTotal !== undefined) {
    parts.push(`${input.installmentCurrent}/${input.installmentTotal}`);
  }
  return parts.join("|");
}

export async function getBillingConfigForMonth(month: string): Promise<BillingConfig> {
  await ensureDefaults();

  if (!supportsBillingConfig()) {
    return {
      defaultClosingDay: 31,
      effectiveClosingDay: clampClosingDay(31, month),
    };
  }

  const client = prisma as unknown as {
    billingSettings: {
      findUnique: (args: { where: { id: number } }) => Promise<{ defaultClosingDay: number } | null>;
      update: (args: { where: { id: number }; data: { defaultClosingDay: number } }) => Promise<unknown>;
    };
  };

  const settings = await client.billingSettings.findUnique({ where: { id: 1 } });
  const defaultClosingDay = settings?.defaultClosingDay ?? 31;

  return {
    defaultClosingDay,
    effectiveClosingDay: clampClosingDay(defaultClosingDay, month),
  };
}

export async function computeInvoiceMonth(expenseDate: Date): Promise<string> {
  const expenseMonth = toMonthKey(expenseDate);
  const { effectiveClosingDay } = await getBillingConfigForMonth(expenseMonth);
  const expenseDay = expenseDate.getDate();

  if (expenseDay <= effectiveClosingDay) {
    // Transaction is within the current month's closing window.
    // The invoice closes this month, so reference = transaction month.
    return expenseMonth;
  } else {
    // Transaction is past the closing day.
    // The invoice closes next month, so reference = transaction month + 1.
    const firstOfMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1);
    return toMonthKey(addMonths(firstOfMonth, 1));
  }
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

      if (
        establishmentRaw.toUpperCase().includes("PAGAMENTO EFETUADO") &&
        amountCents < 0
      ) {
        continue;
      }

      const installment = parseInstallment(establishmentRaw);
      const cleanName = installment ? installment.cleanName : establishmentRaw;
      const normalizedName = normalizeEstablishment(cleanName);

      let merchant = await prisma.merchant.findUnique({
        where: { normalizedName },
        select: { id: true, categoryId: true },
      });

      if (!merchant) {
        merchant = await prisma.merchant.create({
          data: {
            name: cleanName,
            normalizedName,
            categoryId: defaultCategoryId,
          },
          select: { id: true, categoryId: true },
        });
      }

      // "anuidade" parcelas use the purchase date directly, no installment offset
      const isAnuidade = cleanName.toLowerCase().includes("anuidade");

      // invoiceMonth: anchor on installment #1, then offset by (current - 1) months
      const firstInstallmentInvoiceMonth = await computeInvoiceMonth(date);
      const [fy, fm] = firstInstallmentInvoiceMonth.split("-").map(Number);
      const offset = (installment && !isAnuidade) ? installment.current - 1 : 0;
      const invoiceMonth = offset === 0
        ? firstInstallmentInvoiceMonth
        : toMonthKey(addMonths(new Date(fy, fm - 1, 1), offset));

      const installmentCurrent = installment?.current ?? null;
      const installmentTotal = installment?.total ?? null;

      const rowFingerprint = fingerprint({
        date,
        normalizedName,
        amountCents,
        installmentCurrent: installmentCurrent ?? undefined,
        installmentTotal: installmentTotal ?? undefined,
      });

      const created = await prisma.expense.createMany({
        data: {
          expenseDate: date,
          invoiceMonth,
          amountCents,
          establishmentRaw: cleanName,
          merchantId: merchant.id,
          categoryId: merchant.categoryId,
          fingerprint: rowFingerprint,
          installmentCurrent,
          installmentTotal,
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


export async function recalculateAllInvoiceMonths(): Promise<number> {
  const expenses = await prisma.expense.findMany({
    select: { id: true, expenseDate: true, installmentCurrent: true, establishmentRaw: true },
  });

  for (const expense of expenses) {
    const firstInvoiceMonth = await computeInvoiceMonth(expense.expenseDate);
    const isAnuidade = expense.establishmentRaw.toLowerCase().includes("anuidade");
    const offset = (expense.installmentCurrent != null && !isAnuidade) ? expense.installmentCurrent - 1 : 0;
    const [y, m] = firstInvoiceMonth.split("-").map(Number);
    const invoiceMonth = offset === 0
      ? firstInvoiceMonth
      : toMonthKey(addMonths(new Date(y, m - 1, 1), offset));

    await prisma.expense.update({
      where: { id: expense.id },
      data: { invoiceMonth },
    });
  }

  return expenses.length;
}

export async function dashboardForMonth(month: string) {
  const [expenses, categories] = await Promise.all([
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
    totalSpentCents,
    byCategory,
  };
}

export function inferMonthFromDate(date: Date): string {
  return toMonthKey(date);
}
