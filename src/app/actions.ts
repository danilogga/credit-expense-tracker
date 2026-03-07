"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEFAULT_CATEGORY_NAME, normalizeCategoryIcon } from "@/lib/constants";
import { currentMonthKey, resolveMonthKey } from "@/lib/date";
import { importCsvContent, setDefaultClosingDay, closeInvoice, openInvoice } from "@/lib/domain";
import { parseMoneyToCents } from "@/lib/money";

export async function importCsvAction(formData: FormData) {
  const file = formData.get("csv") as File | null;

  if (!file) {
    redirect("/import?error=Arquivo+CSV+obrigatório");
  }

  const content = await file.text();
  const result = await importCsvContent(content);

  revalidatePath("/");
  revalidatePath("/import");
  revalidatePath("/expenses");
  revalidatePath("/merchants");

  redirect(
    `/import?imported=${result.imported}&duplicates=${result.duplicates}&invalid=${result.invalidRows}`,
  );
}

export async function createCategoryAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "#37A8A4").trim();
  const symbol = normalizeCategoryIcon(String(formData.get("symbol") ?? ""));
  const limitInput = String(formData.get("limit") ?? "").trim();

  if (!name) {
    redirect("/categories?error=Nome+da+categoria+é+obrigatório");
  }

  const { prisma } = await import("@/lib/prisma");
  await prisma.category.create({
    data: {
      name,
      color: /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#37A8A4",
      symbol,
      limitCents: limitInput ? parseMoneyToCents(limitInput) : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/expenses");
  revalidatePath("/merchants");
  redirect("/categories?ok=Categoria+criada");
}

export async function updateCategoryAction(formData: FormData) {
  const categoryId = String(formData.get("categoryId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "#37A8A4").trim();
  const symbol = normalizeCategoryIcon(String(formData.get("symbol") ?? ""));
  const limitInput = String(formData.get("limit") ?? "").trim();

  if (!name) {
    redirect(`/categories/${categoryId}?error=Nome+da+categoria+é+obrigatório`);
  }

  const { prisma } = await import("@/lib/prisma");

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name,
      color: /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#37A8A4",
      symbol,
      limitCents: limitInput ? parseMoneyToCents(limitInput) : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath(`/categories/${categoryId}`);
  revalidatePath("/expenses");
  revalidatePath("/merchants");
  redirect("/categories?ok=Categoria+atualizada");
}

export async function updateMerchantNicknameAction(merchantId: string, nickname: string): Promise<void> {
  const { prisma } = await import("@/lib/prisma");
  await prisma.merchant.update({
    where: { id: merchantId },
    data: { nickname: nickname.trim() || null },
  });
  revalidatePath("/");
  revalidatePath("/merchants");
}

export async function updateMerchantAction(formData: FormData) {
  const merchantId = String(formData.get("merchantId") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");

  if (!merchantId) redirect("/merchants?error=Estabelecimento+não+encontrado");

  const { prisma } = await import("@/lib/prisma");
  await prisma.$transaction([
    prisma.merchant.update({
      where: { id: merchantId },
      data: { nickname: nickname || null, categoryId },
    }),
    prisma.expense.updateMany({
      where: { merchantId },
      data: { categoryId },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/merchants");
  redirect("/merchants?ok=Estabelecimento+atualizado");
}

export async function updateExpenseCategoryAction(formData: FormData) {
  const expenseId = String(formData.get("expenseId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const month = String(formData.get("month") ?? currentMonthKey());
  const page = Math.max(1, Number(formData.get("page") ?? "1") || 1);

  const { prisma } = await import("@/lib/prisma");
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    select: { merchantId: true },
  });

  if (expense) {
    await prisma.$transaction([
      prisma.expense.update({ where: { id: expenseId }, data: { categoryId } }),
      prisma.merchant.update({ where: { id: expense.merchantId }, data: { categoryId } }),
    ]);
  }

  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/merchants");
  redirect(`/?month=${month}&page=${page}&ok=Categoria+da+despesa+atualizada`);
}

export async function updateExpenseInvoiceMonthAction(formData: FormData) {
  const expenseId = String(formData.get("expenseId") ?? "");
  const invoiceMonth = String(formData.get("invoiceMonth") ?? "");
  const month = String(formData.get("month") ?? currentMonthKey());
  const page = Math.max(1, Number(formData.get("page") ?? "1") || 1);

  if (!/^\d{4}-\d{2}$/.test(invoiceMonth)) {
    redirect(`/?month=${month}&page=${page}&error=Mês+de+referência+inválido`);
  }

  const { prisma } = await import("@/lib/prisma");
  await prisma.expense.update({
    where: { id: expenseId },
    data: { invoiceMonth },
  });

  revalidatePath("/");
  revalidatePath("/expenses");
  redirect(`/?month=${month}&page=${page}&ok=Mês+de+referência+atualizado`);
}

export async function closeInvoiceAction(formData: FormData) {
  const month = String(formData.get("month") ?? "");
  const fromInvoices = formData.get("returnTo") === "invoices";

  if (!/^\d{4}-\d{2}$/.test(month)) {
    redirect(fromInvoices ? "/invoices?error=Mês+inválido" : "/?error=Mês+inválido");
  }

  await closeInvoice(month);

  revalidatePath("/");
  revalidatePath("/invoices");
  redirect(fromInvoices ? "/invoices?ok=Fatura+fechada+com+sucesso" : `/?month=${month}&ok=Fatura+fechada+com+sucesso`);
}

export async function openInvoiceAction(formData: FormData) {
  const month = String(formData.get("month") ?? "");
  const fromInvoices = formData.get("returnTo") === "invoices";

  if (!/^\d{4}-\d{2}$/.test(month)) {
    redirect(fromInvoices ? "/invoices?error=Mês+inválido" : "/?error=Mês+inválido");
  }

  await openInvoice(month);

  revalidatePath("/");
  revalidatePath("/invoices");
  redirect(fromInvoices ? "/invoices?ok=Fatura+aberta+com+sucesso" : `/?month=${month}&ok=Fatura+aberta+com+sucesso`);
}

export async function setDefaultClosingDayAction(formData: FormData) {
  const day = Number(formData.get("defaultClosingDay"));
  const returnTo = String(formData.get("returnTo") ?? "billing");

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    redirect(`/${returnTo}?error=Dia+de+virada+inválido`);
  }

  await setDefaultClosingDay(day);

  revalidatePath("/");
  revalidatePath("/billing");
  revalidatePath("/invoices");
  redirect(`/${returnTo}?ok=Dia+padrão+atualizado`);
}


export async function deleteCategoryAction(formData: FormData) {
  const categoryId = String(formData.get("categoryId") ?? "");

  const { prisma } = await import("@/lib/prisma");
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { merchants: true, expenses: true } } },
  });

  if (!category) redirect("/categories?error=Categoria+não+encontrada");
  if (category.name === DEFAULT_CATEGORY_NAME)
    redirect(`/categories/${categoryId}?error=Não+é+possível+excluir+a+categoria+padrão`);
  if (category._count.merchants > 0)
    redirect(`/categories/${categoryId}?error=Categoria+possui+${category._count.merchants}+estabelecimento(s)+vinculado(s)`);
  if (category._count.expenses > 0)
    redirect(`/categories/${categoryId}?error=Categoria+possui+${category._count.expenses}+despesa(s)+vinculada(s)`);

  await prisma.category.delete({ where: { id: categoryId } });

  revalidatePath("/");
  revalidatePath("/categories");
  redirect("/categories?ok=Categoria+excluída+com+sucesso");
}

export async function deleteMerchantAction(formData: FormData) {
  const merchantId = String(formData.get("merchantId") ?? "");

  const { prisma } = await import("@/lib/prisma");
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    include: { _count: { select: { expenses: true } } },
  });

  if (!merchant) redirect("/merchants?error=Estabelecimento+não+encontrado");
  if (merchant._count.expenses > 0)
    redirect(`/merchants/${merchantId}?error=Estabelecimento+possui+${merchant._count.expenses}+despesa(s)+registrada(s).+Reclassifique-as+antes+de+excluir.`);

  await prisma.merchant.delete({ where: { id: merchantId } });

  revalidatePath("/");
  revalidatePath("/merchants");
  revalidatePath("/expenses");
  redirect("/merchants?ok=Estabelecimento+excluído+com+sucesso");
}
