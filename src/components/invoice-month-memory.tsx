"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const STORAGE_KEY = "creditexp:selectedInvoiceMonth";

type Props = {
  currentMonth: string;
  hasExplicitMonth: boolean;
};

export function InvoiceMonthMemory({ currentMonth, hasExplicitMonth }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!hasExplicitMonth && saved && saved !== currentMonth) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", saved);
      params.delete("filterMonth");
      params.delete("filterYear");
      params.delete("page");

      router.replace(`${pathname}?${params.toString()}`);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, currentMonth);
  }, [currentMonth, hasExplicitMonth, pathname, router, searchParams]);

  return null;
}
