-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "invoiceMonth" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "BillingSettings" (
    "id" INTEGER NOT NULL,
    "defaultClosingDay" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingClosingOverride" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "closingDay" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingClosingOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingClosingOverride_month_key" ON "BillingClosingOverride"("month");

-- CreateIndex
CREATE INDEX "Expense_invoiceMonth_idx" ON "Expense"("invoiceMonth");
