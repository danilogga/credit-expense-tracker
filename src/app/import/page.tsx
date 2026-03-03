import { importCsvAction } from "@/app/actions";
import { ImportDropzone } from "@/app/import/import-dropzone";
import { QueryToast } from "@/components/query-toast";

type SearchParams = Promise<{ imported?: string; duplicates?: string; invalid?: string; error?: string }>;

export default async function ImportPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const hasResult = typeof params.imported === "string";
  const successMessage = hasResult
    ? `Arquivo importado com sucesso. Importados: ${params.imported ?? "0"} · Duplicados: ${params.duplicates ?? "0"} · Inválidos: ${params.invalid ?? "0"}`
    : undefined;

  return (
    <div className="panel">
      <QueryToast successMessage={successMessage} errorMessage={params.error} />
      <h2>Importação de CSV</h2>
      <p className="muted">
        Formato esperado: colunas de <b>data</b>, <b>estabelecimento</b> (ou <b>lançamento</b>) e <b>valor</b>.
      </p>

      <ImportDropzone action={importCsvAction} />

      {hasResult ? (
        <div>
          <p className="tag">Importados: {params.imported ?? "0"}</p>
          <p className="tag">Duplicados descartados: {params.duplicates ?? "0"}</p>
          <p className="tag">Linhas inválidas: {params.invalid ?? "0"}</p>
        </div>
      ) : null}
    </div>
  );
}
