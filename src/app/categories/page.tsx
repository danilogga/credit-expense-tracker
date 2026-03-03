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

function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? "#1a1a1a" : "#ffffff";
}

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
    <div className="panel">
      <QueryToast successMessage={params.ok} errorMessage={params.error} />
      <h2>Categorias</h2>

      <p>
        <Link href="/categories/new" className="btn-primary">
          <Plus size={16} weight="bold" />
          Nova categoria
        </Link>
      </p>

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
                  style={{ backgroundColor: category.color, color: contrastColor(category.color) }}
                >
                  <CategoryIcon icon={category.symbol} color={contrastColor(category.color)} size={15} />
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
  );
}
