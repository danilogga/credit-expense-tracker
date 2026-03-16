import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dashboardForMonth, ensureDefaults, isInvoiceClosed } from "@/lib/domain";
import { resolveMonthKey, currentMonthKey } from "@/lib/date";
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  // A — Auth
  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.API_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // B — Params
  const { searchParams } = request.nextUrl;

  const monthParam = searchParams.get("month") ?? undefined;
  const month = monthParam
    ? resolveMonthKey({ month: monthParam })
    : currentMonthKey();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);

  const pageSizeParam = parseInt(searchParams.get("pageSize") ?? "");
  const pageSize = PAGE_SIZE_OPTIONS.includes(pageSizeParam) ? pageSizeParam : DEFAULT_PAGE_SIZE;

  const categoryId = searchParams.get("categoryId") ?? undefined;
  const q = (searchParams.get("q") ?? "").trim();

  const skip = (page - 1) * pageSize;

  // C — Fetch
  await ensureDefaults();

  const expenseWhere = {
    invoiceMonth: month,
    ...(categoryId ? { categoryId } : {}),
    ...(q ? {
      merchant: {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { nickname: { contains: q, mode: "insensitive" as const } },
        ],
      },
    } : {}),
  };

  const [dashboard, totalExpenses, expenses, allCategories, invoiceClosed] = await Promise.all([
    dashboardForMonth(month),
    prisma.expense.count({ where: expenseWhere }),
    prisma.expense.findMany({
      where: expenseWhere,
      include: { merchant: true, category: true },
      orderBy: [{ expenseDate: "desc" }, { merchant: { name: "asc" } }],
      skip,
      take: pageSize,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true, symbol: true, favorite: true },
    }),
    isInvoiceClosed(month),
  ]);

  // Merge byCategory (limitCents + spentCents) with allCategories (color + symbol)
  const categoryColorMap = new Map(allCategories.map((c) => [c.id, { color: c.color, symbol: c.symbol }]));
  const spendMap = new Map(dashboard.byCategory.map((c) => [c.id, { limitCents: c.limitCents, spentCents: c.spentCents }]));

  const categories = allCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    symbol: cat.symbol,
    favorite: cat.favorite,
    limitCents: spendMap.get(cat.id)?.limitCents ?? null,
    spentCents: spendMap.get(cat.id)?.spentCents ?? 0,
  }));

  // D — Pagination
  const totalPages = Math.max(1, Math.ceil(totalExpenses / pageSize));

  // E — Response
  return NextResponse.json({
    month,
    invoiceClosed,
    totalSpentCents: dashboard.totalSpentCents,
    categories,
    pagination: { page, pageSize, totalExpenses, totalPages },
    expenses: expenses.map((e) => ({
      id: e.id,
      expenseDate: e.expenseDate.toISOString().slice(0, 10),
      invoiceMonth: e.invoiceMonth,
      amountCents: e.amountCents,
      installmentCurrent: e.installmentCurrent,
      installmentTotal: e.installmentTotal,
      ignored: e.ignored,
      merchant: {
        id: e.merchant.id,
        name: e.merchant.name,
        nickname: e.merchant.nickname,
      },
      category: {
        id: e.category.id,
        name: e.category.name,
        color: e.category.color,
        symbol: e.category.symbol,
      },
    })),
  });
}
