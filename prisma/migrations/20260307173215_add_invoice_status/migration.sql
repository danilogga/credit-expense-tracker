-- CreateTable
CREATE TABLE "Invoice" (
    "month" TEXT NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("month")
);
