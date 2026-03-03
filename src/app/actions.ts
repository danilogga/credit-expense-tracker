"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEFAULT_CATEGORY_NAME, normalizeCategoryIcon } from "@/lib/constants";
import { currentMonthKey, resolveMonthKey } from "@/lib/date";
import {
  importCsvContent,
  recalculateAllInvoiceMonths,
  removeClosingOverride,
  setClosingOverride,
  setDefaultClosingDay,
  setMonthlyBudget,
} from "@/lib/domain";
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
  await prisma.expense.update({
    where: { id: expenseId },
    data: { categoryId },
  });

  revalidatePath("/");
  revalidatePath("/expenses");
  redirect(`/?month=${month}&page=${page}&ok=Categoria+da+despesa+atualizada`);
}

export async function setMonthlyBudgetAction(formData: FormData) {
  const month = String(formData.get("month") ?? currentMonthKey());
  const amount = String(formData.get("amount") ?? "");

  if (!amount) {
    redirect(`/?month=${month}&error=Orçamento+obrigatório`);
  }

  await setMonthlyBudget(month, parseMoneyToCents(amount));

  revalidatePath("/");
  redirect(`/?month=${month}&ok=Orçamento+atualizado`);
}

export async function setDefaultClosingDayAction(formData: FormData) {
  const month = String(formData.get("month") ?? currentMonthKey());
  const day = Number(formData.get("defaultClosingDay"));

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    redirect(`/billing?month=${month}&error=Dia+de+virada+inválido`);
  }

  await setDefaultClosingDay(day);
  const recalculated = await recalculateAllInvoiceMonths();

  revalidatePath("/");
  revalidatePath("/billing");
  revalidatePath("/expenses");
  redirect(`/billing?month=${month}&ok=Dia+padrão+atualizado+(${recalculated}+despesas+recalculadas)`);
}

export async function setClosingOverrideAction(formData: FormData) {
  const month = resolveMonthKey({
    month: String(formData.get("month") ?? ""),
    monthNumber: String(formData.get("overrideMonthNumber") ?? ""),
    year: String(formData.get("overrideYear") ?? ""),
  });
  const day = Number(formData.get("closingDay"));

  if (!month) {
    redirect("/billing?error=Mês+da+exceção+obrigatório");
  }

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    redirect(`/billing?month=${month}&error=Dia+de+virada+inválido`);
  }

  await setClosingOverride(month, day);
  const recalculated = await recalculateAllInvoiceMonths();

  revalidatePath("/");
  revalidatePath("/billing");
  revalidatePath("/expenses");
  redirect(`/billing?month=${month}&ok=Exceção+salva+(${recalculated}+despesas+recalculadas)`);
}

export async function removeClosingOverrideAction(formData: FormData) {
  const month = String(formData.get("month") ?? "");

  if (!month) {
    redirect("/billing?error=Mês+da+exceção+obrigatório");
  }

  await removeClosingOverride(month);
  const recalculated = await recalculateAllInvoiceMonths();

  revalidatePath("/");
  revalidatePath("/billing");
  revalidatePath("/expenses");
  redirect(`/billing?month=${month}&ok=Exceção+removida+(${recalculated}+despesas+recalculadas)`);
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
