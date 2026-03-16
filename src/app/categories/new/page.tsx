import Link from "next/link";
import { FloppyDisk, X, Star } from "@phosphor-icons/react/dist/ssr";
import { createCategoryAction } from "@/app/actions";
import { CategoryColorPicker } from "@/components/category-color-picker";
import { CategoryIconPicker } from "@/components/category-icon-picker";
import { QueryToast } from "@/components/query-toast";

type SearchParams = Promise<{ error?: string }>;

export default async function NewCategoryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  return (
    <div>
      <QueryToast errorMessage={params.error} />
      <div className="page-header">
        <div>
          <h1>Nova categoria</h1>
          <p className="muted">Crie uma nova categoria de despesas</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 520 }}>
        <form className="category-form" action={createCategoryAction}>
          <label htmlFor="name">Nome</label>
          <input id="name" name="name" placeholder="Ex: Mercado" required />

          <label>Ícone</label>
          <CategoryIconPicker selected="circle" />

          <label>Cor</label>
          <CategoryColorPicker defaultColor="#37A8A4" />

          <label htmlFor="limit">Limite mensal (opcional)</label>
          <input id="limit" name="limit" placeholder="Ex: 800,00" />

          <label className="checkbox-label">
            <input type="checkbox" name="favorite" id="favorite" />
            <Star size={15} weight="fill" style={{ color: "#f5a623" }} />
            Marcar como favorita
          </label>

          <div className="inline">
            <button type="submit">
              <FloppyDisk size={16} weight="bold" />
              Salvar categoria
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
