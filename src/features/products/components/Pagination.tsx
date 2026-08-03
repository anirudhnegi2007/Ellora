"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}

export function Pagination({ currentPage, totalPages, total, limit }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/products?${params.toString()}`);
  };

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  // Generate list of page numbers to render
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-6 sm:flex-row dark:border-zinc-800">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Showing <span className="font-semibold text-zinc-800 dark:text-zinc-200">{startItem}</span> to{" "}
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{endItem}</span> of{" "}
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{total}</span> results
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-xs text-zinc-400 dark:text-zinc-600"
              >
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs dark:bg-indigo-500"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
