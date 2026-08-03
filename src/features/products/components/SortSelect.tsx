"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.delete("page"); // Reset pagination on sort change
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="product-sort-select"
        className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap"
      >
        Sort By:
      </label>
      <div className="relative inline-block">
        <select
          id="product-sort-select"
          aria-label="Sort products"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="
            h-10 appearance-none rounded-lg border border-zinc-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-zinc-800 shadow-sm
            transition-colors cursor-pointer hover:border-zinc-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
            dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:focus:border-indigo-400
          "
        >
          <optgroup label="Price Order">
            <option value="price-asc">Price: Low to High (↑)</option>
            <option value="price-desc">Price: High to Low (↓)</option>
          </optgroup>
          <optgroup label="Customer Rating">
            <option value="rating-desc">Rating: Highest First (★ 5 → 1)</option>
            <option value="rating-asc">Rating: Lowest First (★ 1 → 5)</option>
          </optgroup>
          <optgroup label="Release Date">
            <option value="newest">Newest Arrivals</option>
            <option value="oldest">Oldest First</option>
          </optgroup>
          <optgroup label="Name / Title">
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </optgroup>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-500 dark:text-zinc-400">
          <ArrowUpDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
