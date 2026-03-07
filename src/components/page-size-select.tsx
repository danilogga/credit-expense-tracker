"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";

export const COOKIE_NAME = "preferredPageSize";

type Props = {
  value: number;
};

export function PageSizeSelect({ value }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = e.target.value;
    document.cookie = `${COOKIE_NAME}=${selected}; path=/; max-age=${365 * 24 * 60 * 60}`;
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", selected);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="muted" style={{ fontSize: "0.8rem" }}>
      Linhas por página:
      <select value={String(value)} onChange={handleChange} style={{ marginLeft: 6 }}>
        {PAGE_SIZE_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </label>
  );
}
