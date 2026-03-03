import Link from "next/link";
import { FloppyDisk, X, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { updateCategoryAction } from "@/app/actions";
import { CategoryColorPicker } from "@/components/category-color-picker";
import { CategoryIconPicker } from "@/components/category-icon-picker";
import { QueryToast } from "@/components/query-toast";
import { ensureDefaults } from "@/lib/domain";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ error?: string }>;

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const query = await searchParams;

  await ensureDefaults();

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    return (
      <div>
        <div className="page-header">
          <h1>Categoria não encontrada</h1>
        </div>
        <div className="panel" style={{ maxWidth: 520 }}>
          <Link href="/categories" className="btn-secondary">
            <ArrowLeft size={15} />
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <QueryToast errorMessage={query.error} />
      <div className="page-header">
        <div>
          <h1>Editar categoria</h1>
          <p className="muted">{category.name}</p>
        </div>
        <Link href="/categories" className="btn-secondary">
          <ArrowLeft size={15} />
          Voltar à lista
        </Link>
      </div>

      <div className="panel" style={{ maxWidth: 520 }}>
        <form className="category-form" action={updateCategoryAction}>
          <input type="hidden" name="categoryId" value={category.id} />

          <label htmlFor="name">Nome</label>
          <input id="name" name="name" defaultValue={category.name} required />

          <label>Ícone</label>
          <CategoryIconPicker selected={category.symbol} />

          <label>Cor</label>
          <CategoryColorPicker defaultColor={category.color} />

          <label htmlFor="limit">Limite mensal (opcional)</label>
          <input
            id="limit"
            name="limit"
            placeholder="Ex: 800,00"
            defaultValue={
              category.limitCents !== null ? String((category.limitCents / 100).toFixed(2)).replace(".", ",") : ""
            }
          />

          <div className="inline">
            <button type="submit">
              <FloppyDisk size={16} weight="bold" />
              Salvar alterações
            </button>
            <Link href="/categories" className="btn-secondary">
              <X size={15} />
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
