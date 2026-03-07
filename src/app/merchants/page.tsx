import Link from "next/link";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { deleteMerchantAction } from "@/app/actions";
import { CategoryIcon } from "@/components/category-icon";
import { DeleteButton } from "@/components/delete-button";
import { PaginationControl } from "@/components/pagination-control";
import { QueryToast } from "@/components/query-toast";
import { MerchantSearchInput } from "@/components/merchant-search-input";
import { PageSizeSelect } from "@/components/page-size-select";
import { resolvePageSize } from "@/lib/pagination-server";
import { ensureDefaults } from "@/lib/domain";
import { prisma } from "@/lib/prisma";


type SearchParams = Promise<{ ok?: string; error?: string; page?: string; q?: string; pageSize?: string }>;

export default async function MerchantsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() ?? "";
  const pageSize = await resolvePageSize(params.pageSize);
  const skip = (page - 1) * pageSize;

  await ensureDefaults();

  const where = q
    ? { OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { nickname: { contains: q, mode: "insensitive" as const } },
      ]}
    : undefined;

  const [total, merchants] = await Promise.all([
    prisma.merchant.count({ where }),
    prisma.merchant.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <QueryToast successMessage={params.ok} errorMessage={params.error} />
      <div className="page-header">
        <div>
          <h1>Estabelecimentos</h1>
          <p className="muted">Alterar a categoria atualiza todas as despesas existentes do estabelecimento</p>
        </div>
        <MerchantSearchInput defaultValue={q} />
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
              const color = merchant.category.color;
              return (
                <tr key={merchant.id}>
                  <td>{merchant.name}</td>
                  <td>{merchant.nickname ?? <span className="muted">—</span>}</td>
                  <td>
                    <span
                      className="category-pill"
                      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}55` }}
                    >
                      <CategoryIcon icon={merchant.category.symbol} color={color} size={14} />
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
          Página {page} de {totalPages} ({total} {q ? "resultado(s)" : "estabelecimentos"})
        </span>
        <div className="inline">
          <PageSizeSelect value={pageSize} />
          <PaginationControl currentPage={page} totalPages={totalPages} />
        </div>
      </div>
      </div>
    </div>
  );
}
