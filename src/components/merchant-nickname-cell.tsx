"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateMerchantNicknameAction } from "@/app/actions";

type Props = {
  merchantId: string;
  name: string;
  nickname: string | null;
};

export function MerchantNicknameCell({ merchantId, name, nickname }: Props) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(nickname);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setCurrent(nickname);
  }, [nickname]);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);
  const router = useRouter();

  function startEditing() {
    cancelledRef.current = false;
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function save(value: string) {
    const trimmed = value.trim();
    setCurrent(trimmed || null);
    setEditing(false);
    setIsPending(true);
    await updateMerchantNicknameAction(merchantId, trimmed);
    router.refresh();
    setIsPending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      cancelledRef.current = true;
      setEditing(false);
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }
    save(e.currentTarget.value);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="nickname-inline-input"
        defaultValue={current ?? ""}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={name}
      />
    );
  }

  return (
    <span
      className={`nickname-inline-text${isPending ? " nickname-inline-pending" : ""}`}
      onClick={startEditing}
      data-tooltip={current ? name : "Clique para adicionar apelido"}
      data-tooltip-pos="top"
    >
      {current || name}
    </span>
  );
}
