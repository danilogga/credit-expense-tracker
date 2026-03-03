import Link from "next/link";
import { FloppyDisk, X } from "@phosphor-icons/react/dist/ssr";
import { createCategoryAction } from "@/app/actions";
import { CategoryColorPicker } from "@/components/category-color-picker";
import { CategoryIconPicker } from "@/components/category-icon-picker";
import { QueryToast } from "@/components/query-toast";

type SearchParams = Promise<{ error?: string }>;

export default async function NewCategoryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  return (
    <div className="panel">
      <QueryToast errorMessage={params.error} />
      <h2>Nova categoria</h2>

      <form className="category-form" action={createCategoryAction}>
        <label htmlFor="name">Nome</label>
        <input id="name" name="name" placeholder="Ex: Mercado" required />

        <label>Ícone</label>
        <CategoryIconPicker selected="circle" />

        <label>Cor</label>
        <CategoryColorPicker defaultColor="#37A8A4" />

        <label htmlFor="limit">Limite mensal (opcional)</label>
        <input id="limit" name="limit" placeholder="Ex: 800,00" />

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
  );
}
