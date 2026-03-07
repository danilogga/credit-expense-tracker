import { cookies } from "next/headers";
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE, PAGE_SIZE_COOKIE } from "@/lib/pagination";

export async function resolvePageSize(paramValue: string | undefined): Promise<number> {
  if (PAGE_SIZE_OPTIONS.includes(Number(paramValue))) {
    return Number(paramValue);
  }
  const cookieStore = await cookies();
  const saved = Number(cookieStore.get(PAGE_SIZE_COOKIE)?.value ?? DEFAULT_PAGE_SIZE);
  return PAGE_SIZE_OPTIONS.includes(saved) ? saved : DEFAULT_PAGE_SIZE;
}
