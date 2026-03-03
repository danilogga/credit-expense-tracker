"use client";

import { useState } from "react";

type Props = {
  imported: string;
  duplicates: string;
  invalid: string;
};

export function ImportResultPopup({ imported, duplicates, invalid }: Props) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return null;
  }

  return (
    <div className="popup-backdrop" role="dialog" aria-modal="true" aria-label="Resultado da importação">
      <div className="popup-card">
        <h3>Importação finalizada com sucesso</h3>
        <p className="muted">O arquivo foi processado.</p>
        <ul className="popup-list">
          <li>Importados: {imported}</li>
          <li>Duplicados descartados: {duplicates}</li>
          <li>Linhas inválidas: {invalid}</li>
        </ul>
        <button type="button" onClick={() => setOpen(false)}>
          Fechar
        </button>
      </div>
    </div>
  );
}
