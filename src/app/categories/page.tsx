import Link from "next/link";
import { Plus, PencilSimple, Star } from "@phosphor-icons/react/dist/ssr";
import { deleteCategoryAction } from "@/app/actions";
import { CategoryIcon } from "@/components/category-icon";
import { DeleteButton } from "@/components/delete-button";
import { PaginationControl } from "@/components/pagination-control";
import { PageSizeSelect } from "@/components/page-size-select";
import { SearchInput } from "@/components/search-input";
import { resolvePageSize } from "@/lib/pagination-server";
import { QueryToast } from "@/components/query-toast";
import { ensureDefaults } from "@/lib/domain";
import { formatCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{ ok?: string; error?: string; page?: string; pageSize?: string; q?: string }>;

export default async function CategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = await resolvePageSize(params.pageSize);
  const q = params.q?.trim() ?? "";
  const skip = (page - 1) * pageSize;

  await ensureDefaults();

  const where = q
    ? { name: { contains: q, mode: "insensitive" as const } }
    : undefined;

  const [total, categories] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
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
          <h1>Categorias</h1>
          <p className="muted">Gerencie as categorias de despesas</p>
        </div>
        <div className="inline">
          <SearchInput defaultValue={q} placeholder="Buscar por nome…" />
          <Link href="/categories/new" className="btn-primary">
            <Plus size={16} weight="bold" />
            Nova categoria
          </Link>
        </div>
      </div>

      <div className="panel">
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Identificação</th>
            <th className="col-right">Limite mensal</th>
            <th className="col-right">Favorita</th>
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
                {category.favorite
                  ? <Star size={16} weight="fill" style={{ color: "#f5a623" }} />
                  : <span className="muted">—</span>}
              </td>
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
          Página {page} de {totalPages} ({total} {q ? "resultado(s)" : "categorias"})
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
