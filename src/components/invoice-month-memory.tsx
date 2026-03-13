"use client";

import { useEffect } from "react";

const COOKIE_KEY = "creditexp:selectedInvoiceMonth";

type Props = {
  currentMonth: string;
  hasExplicitMonth: boolean;
};

export function InvoiceMonthMemory({ currentMonth, hasExplicitMonth }: Props) {
  useEffect(() => {
    if (!hasExplicitMonth) return;
    document.cookie = `${COOKIE_KEY}=${currentMonth};path=/;max-age=${60 * 60 * 24 * 365}`;
  }, [currentMonth, hasExplicitMonth]);

  return null;
}
