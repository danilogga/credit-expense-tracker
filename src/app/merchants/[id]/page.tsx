import Link from "next/link";
import { FloppyDisk, X, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { updateMerchantAction } from "@/app/actions";
import { QueryToast } from "@/components/query-toast";
import { ensureDefaults } from "@/lib/domain";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ error?: string }>;

export default async function EditMerchantPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const query = await searchParams;

  await ensureDefaults();

  const [merchant, categories] = await Promise.all([
    prisma.merchant.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!merchant) {
    return (
      <div>
        <div className="page-header">
          <h1>Estabelecimento não encontrado</h1>
        </div>
        <div className="panel" style={{ maxWidth: 520 }}>
          <Link href="/merchants" className="btn-secondary">
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
          <h1>Editar estabelecimento</h1>
          <p className="muted">{merchant.nickname ?? merchant.name}</p>
        </div>
        <Link href="/merchants" className="btn-secondary">
          <ArrowLeft size={15} />
          Voltar à lista
        </Link>
      </div>

      <div className="panel" style={{ maxWidth: 520 }}>
        <form className="category-form" action={updateMerchantAction}>
          <input type="hidden" name="merchantId" value={merchant.id} />

          <label>Nome</label>
          <input value={merchant.name} disabled />

          <label htmlFor="nickname">Apelido</label>
          <input
            id="nickname"
            name="nickname"
            placeholder="Ex: Mercadão do Bairro"
            defaultValue={merchant.nickname ?? ""}
          />

          <label htmlFor="categoryId">Categoria</label>
          <select id="categoryId" name="categoryId" defaultValue={merchant.categoryId}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <p className="muted" style={{ marginTop: 0 }}>
            Ao alterar a categoria, todas as despesas deste estabelecimento também serão atualizadas.
          </p>

          <div className="inline">
            <button type="submit">
              <FloppyDisk size={16} weight="bold" />
              Salvar alterações
            </button>
            <Link href="/merchants" className="btn-secondary">
              <X size={15} />
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
