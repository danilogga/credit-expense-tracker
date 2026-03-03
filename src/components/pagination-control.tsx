"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ReactPaginate from "react-paginate";

type Props = {
  currentPage: number;
  totalPages: number;
};

export function PaginationControl({ currentPage, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) {
    return null;
  }

  function buildUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  return (
    <ReactPaginate
      breakLabel="..."
      nextLabel="Próxima"
      previousLabel="Anterior"
      forcePage={Math.max(0, currentPage - 1)}
      onPageChange={(selectedItem) => {
        startTransition(() => {
          router.push(buildUrl(selectedItem.selected + 1), { scroll: false });
        });
      }}
      pageRangeDisplayed={3}
      marginPagesDisplayed={1}
      pageCount={totalPages}
      containerClassName={`pagination-lib${isPending ? " pagination-lib-loading" : ""}`}
      pageClassName="pagination-lib-item"
      pageLinkClassName="pagination-lib-link"
      previousClassName="pagination-lib-item"
      previousLinkClassName="pagination-lib-link"
      nextClassName="pagination-lib-item"
      nextLinkClassName="pagination-lib-link"
      breakClassName="pagination-lib-break"
      activeClassName="pagination-lib-active"
      disabledClassName="pagination-lib-disabled"
      renderOnZeroPageCount={null}
    />
  );
}
