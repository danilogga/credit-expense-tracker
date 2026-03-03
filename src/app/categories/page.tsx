import Link from "next/link";
import { Plus, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { deleteCategoryAction } from "@/app/actions";
import { CategoryIcon } from "@/components/category-icon";
import { DeleteButton } from "@/components/delete-button";
import { PaginationControl } from "@/components/pagination-control";
import { QueryToast } from "@/components/query-toast";
import { ensureDefaults } from "@/lib/domain";
import { formatCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

type SearchParams = Promise<{ ok?: string; error?: string; page?: string }>;

export default async function CategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  await ensureDefaults();

  const [total, categories] = await Promise.all([
    prisma.category.count(),
    prisma.category.findMany({
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
          <h1>Categorias</h1>
          <p className="muted">Gerencie as categorias de despesas</p>
        </div>
        <Link href="/categories/new" className="btn-primary">
          <Plus size={16} weight="bold" />
          Nova categoria
        </Link>
      </div>

      <div className="panel">
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Identificação</th>
            <th className="col-right">Limite mensal</th>
            <th className="col-right">Ação</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>
                <span
                  className="category-pill"
                  style={{
                    backgroundColor: `${category.color}22`,
                    color: category.color,
                    border: `1px solid ${category.color}55`,
                  }}
                >
                  <CategoryIcon icon={category.symbol} color={category.color} size={15} />
                  {category.name}
                </span>
              </td>
              <td className="col-right">{category.limitCents !== null ? formatCents(category.limitCents) : "Sem limite"}</td>
              <td className="col-right">
                <div className="inline">
                  <Link href={`/categories/${category.id}`} className="btn-secondary btn-icon" data-tooltip="Editar">
                    <PencilSimple size={16} />
                  </Link>
                  <DeleteButton
                    action={deleteCategoryAction}
                    idField="categoryId"
                    id={category.id}
                    confirmMessage="Excluir esta categoria? Esta ação não pode ser desfeita."
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <span className="muted">
          Página {page} de {totalPages} ({total} categorias)
        </span>
        <PaginationControl currentPage={page} totalPages={totalPages} />
      </div>
      </div>
    </div>
  );
}
