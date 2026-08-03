"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X, RotateCcw } from "lucide-react";
import type { Category } from "@/types";

interface ActiveFiltersProps {
  categories: Category[];
}

export function ActiveFilters({ categories }: ActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q");
  const categorySlug = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minRating = searchParams.get("minRating");
  const inStock = searchParams.get("inStock") === "true";

  const categoryName = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.name || categorySlug
    : null;

  const removeParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const removePrice = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("page");
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const clearAll = () => {
    router.push("/products");
  };

  const priceLabel = (() => {
    if (minPrice && maxPrice) return `$${minPrice} – $${maxPrice}`;
    if (minPrice) return `$${minPrice}+`;
    if (maxPrice) return `Under $${maxPrice}`;
    return null;
  })();

  const hasAnyFilter = Boolean(q || categorySlug || minPrice || maxPrice || minRating || inStock);

  if (!hasAnyFilter) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Active Filters:
      </span>

      {q && (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
          Query: &ldquo;{q}&rdquo;
          <button
            onClick={() => removeParam("q")}
            className="ml-1 rounded-full p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {categoryName && (
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
          Category: {categoryName}
          <button
            onClick={() => removeParam("category")}
            className="ml-1 rounded-full p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {priceLabel && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          Price: {priceLabel}
          <button
            onClick={removePrice}
            className="ml-1 rounded-full p-0.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {minRating && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
          Rating: {minRating}★ & Up
          <button
            onClick={() => removeParam("minRating")}
            className="ml-1 rounded-full p-0.5 hover:bg-amber-100 dark:hover:bg-amber-900/60"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {inStock && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
          In Stock Only
          <button
            onClick={() => removeParam("inStock")}
            className="ml-1 rounded-full p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900/60"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      <button
        onClick={clearAll}
        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 ml-1"
      >
        <RotateCcw className="h-3 w-3" />
        Clear All
      </button>
    </div>
  );
}
