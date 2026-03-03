"use client";

import { useRef } from "react";
import { Trash } from "@phosphor-icons/react";

type Props = {
  action: (formData: FormData) => Promise<void>;
  idField: string;
  id: string;
  confirmMessage?: string;
};

export function DeleteButton({
  action,
  idField,
  id,
  confirmMessage = "Confirma a exclusão? Esta ação não pode ser desfeita.",
}: Props) {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form ref={ref} action={action} style={{ display: "contents" }}>
      <input type="hidden" name={idField} value={id} />
      <button
        type="button"
        className="btn-danger btn-icon"
        data-tooltip="Excluir"
        onClick={() => {
          if (window.confirm(confirmMessage)) {
            ref.current?.requestSubmit();
          }
        }}
      >
        <Trash size={16} />
      </button>
    </form>
  );
}
