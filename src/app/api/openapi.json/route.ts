import { NextResponse } from "next/server";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Credit Expense Tracker API",
    version: "1.0.0",
    description: "API de leitura para o app mobile de monitoramento de despesas.",
  },
  servers: [{ url: "/" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "Token definido em `API_TOKEN` no `.env.local`.",
      },
    },
    schemas: {
      CategorySummary: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx1abc123" },
          name: { type: "string", example: "Alimentação" },
          color: { type: "string", example: "#D86F33" },
          symbol: { type: "string", example: "phosphor:fork-knife" },
          limitCents: { type: ["integer", "null"], examples: [50000, null] },
          spentCents: { type: "integer", example: 32150 },
        },
        required: ["id", "name", "color", "symbol", "limitCents", "spentCents"],
      },
      MerchantSummary: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx1def456" },
          name: { type: "string", example: "IFOOD" },
          nickname: { type: ["string", "null"], examples: ["iFood", null] },
        },
        required: ["id", "name", "nickname"],
      },
      ExpenseItem: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx1ghi789" },
          expenseDate: { type: "string", format: "date", example: "2026-03-05" },
          invoiceMonth: { type: "string", example: "2026-04" },
          amountCents: { type: "integer", example: 4590 },
          installmentCurrent: { type: ["integer", "null"], examples: [2, null] },
          installmentTotal: { type: ["integer", "null"], examples: [3, null] },
          merchant: { $ref: "#/components/schemas/MerchantSummary" },
          category: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              color: { type: "string" },
              symbol: { type: "string" },
            },
            required: ["id", "name", "color", "symbol"],
          },
        },
        required: [
          "id",
          "expenseDate",
          "invoiceMonth",
          "amountCents",
          "installmentCurrent",
          "installmentTotal",
          "merchant",
          "category",
        ],
      },
      PaginationMeta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          pageSize: { type: "integer", example: 15 },
          totalExpenses: { type: "integer", example: 42 },
          totalPages: { type: "integer", example: 3 },
        },
        required: ["page", "pageSize", "totalExpenses", "totalPages"],
      },
      DashboardResponse: {
        type: "object",
        properties: {
          month: { type: "string", example: "2026-03" },
          invoiceClosed: { type: "boolean", example: false },
          totalSpentCents: { type: "integer", example: 154320 },
          categories: {
            type: "array",
            items: { $ref: "#/components/schemas/CategorySummary" },
          },
          pagination: { $ref: "#/components/schemas/PaginationMeta" },
          expenses: {
            type: "array",
            items: { $ref: "#/components/schemas/ExpenseItem" },
          },
        },
        required: [
          "month",
          "invoiceClosed",
          "totalSpentCents",
          "categories",
          "pagination",
          "expenses",
        ],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", example: "Unauthorized" },
        },
        required: ["error"],
      },
    },
  },
  paths: {
    "/api/dashboard": {
      get: {
        summary: "Dados da tela de monitoramento",
        description:
          "Retorna totais, breakdown por categoria e lista paginada de despesas para um mês de fatura.",
        operationId: "getDashboard",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "month",
            in: "query",
            description: "Mês de fatura no formato `YYYY-MM`. Padrão: mês atual.",
            required: false,
            schema: { type: "string", example: "2026-03" },
          },
          {
            name: "page",
            in: "query",
            description: "Número da página (começa em 1).",
            required: false,
            schema: { type: "integer", default: 1, example: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            description: "Itens por página. Valores aceitos: 10, 15, 25, 50, 100.",
            required: false,
            schema: { type: "integer", default: 15, enum: [10, 15, 25, 50, 100] },
          },
          {
            name: "categoryId",
            in: "query",
            description: "Filtrar despesas por ID de categoria.",
            required: false,
            schema: { type: "string", example: "clx1abc123" },
          },
          {
            name: "q",
            in: "query",
            description: "Busca por nome ou apelido do estabelecimento (case-insensitive).",
            required: false,
            schema: { type: "string", example: "ifood" },
          },
        ],
        responses: {
          "200": {
            description: "Dados do dashboard retornados com sucesso.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DashboardResponse" },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

export function GET() {
  return NextResponse.json(spec);
}
