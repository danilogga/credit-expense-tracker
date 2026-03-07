"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type Props = {
  defaultValue?: string;
};

const MIN_CHARS = 3;
const DEBOUNCE_MS = 400;

export function MerchantSearchInput({ defaultValue = "" }: Props) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (value.length === 0 || value.length >= MIN_CHARS) {
        const params = new URLSearchParams();
        if (value) params.set("q", value);
        router.push(`${pathname}?${params.toString()}`);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, pathname, router]);

  return (
    <input
      type="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Buscar por nome ou apelido…"
      className="search-input"
    />
  );
}
