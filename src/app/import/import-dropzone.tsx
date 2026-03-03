"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
};

export function ImportDropzone({ action }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  function setFileList(files: FileList | null) {
    if (!files || files.length === 0 || !inputRef.current) {
      return;
    }

    const transfer = new DataTransfer();
    transfer.items.add(files[0]);
    inputRef.current.files = transfer.files;
    setFileName(files[0].name);
  }

  return (
    <form action={action} className="import-form">
      <input
        ref={inputRef}
        className="visually-hidden-input"
        type="file"
        name="csv"
        accept=".csv,text/csv"
        required
        onChange={(event) => setFileList(event.currentTarget.files)}
      />

      <div
        className={`dropzone ${isDragging ? "dropzone-active" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          setFileList(event.dataTransfer.files);
        }}
      >
        <strong>Arraste e solte o CSV aqui</strong>
        <p className="muted">ou clique para selecionar o arquivo</p>
        <span className="tag">{fileName || "Nenhum arquivo selecionado"}</span>
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? (
        <span className="button-loading">
          <span className="spinner" aria-hidden="true" />
          Processando...
        </span>
      ) : (
        "Importar arquivo"
      )}
    </button>
  );
}
