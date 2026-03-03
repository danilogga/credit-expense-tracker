import Link from "next/link";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { deleteMerchantAction } from "@/app/actions";
import { CategoryIcon } from "@/components/category-icon";
import { DeleteButton } from "@/components/delete-button";
import { PaginationControl } from "@/components/pagination-control";
import { QueryToast } from "@/components/query-toast";
import { ensureDefaults } from "@/lib/domain";
import { prisma } from "@/lib/prisma";

function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? "#1a1a1a" : "#ffffff";
}

const PAGE_SIZE = 25;

type SearchParams = Promise<{ ok?: string; error?: string; page?: string }>;

export default async function MerchantsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  await ensureDefaults();

  const [total, merchants] = await Promise.all([
    prisma.merchant.count(),
    prisma.merchant.findMany({
      include: { category: true },
      orderBy: { name: "asc" },
      skip,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <QueryToast successMessage={params.ok} errorMessage={params.error} />
      <div className="page-header">
        <div>
          <h1>Estabelecimentos</h1>
          <p className="muted">Alterar a categoria atualiza todas as despesas existentes do estabelecimento</p>
        </div>
      </div>

      <div className="panel">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Apelido</th>
            <th>Categoria</th>
            <th className="col-right">Ação</th>
          </tr>
        </thead>
        <tbody>
          {merchants.length === 0 ? (
            <tr>
              <td colSpan={4}>Nenhum estabelecimento importado ainda.</td>
            </tr>
          ) : (
            merchants.map((merchant) => {
              const fg = contrastColor(merchant.category.color);
              return (
                <tr key={merchant.id}>
                  <td>{merchant.name}</td>
                  <td>{merchant.nickname ?? <span className="muted">—</span>}</td>
                  <td>
                    <span
                      className="category-pill"
                      style={{ backgroundColor: merchant.category.color, color: fg }}
                    >
                      <CategoryIcon icon={merchant.category.symbol} color={fg} size={14} />
                      {merchant.category.name}
                    </span>
                  </td>
                  <td className="col-right">
                    <div className="inline">
                      <Link href={`/merchants/${merchant.id}`} className="btn-secondary btn-icon" data-tooltip="Editar">
                        <PencilSimple size={16} />
                      </Link>
                      <DeleteButton
                        action={deleteMerchantAction}
                        idField="merchantId"
                        id={merchant.id}
                        confirmMessage="Excluir este estabelecimento? Esta ação não pode ser desfeita."
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className="pagination">
        <span className="muted">
          Página {page} de {totalPages} ({total} estabelecimentos)
        </span>
        <PaginationControl currentPage={page} totalPages={totalPages} />
      </div>
      </div>
    </div>
  );
}
