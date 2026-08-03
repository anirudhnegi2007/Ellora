"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { Category, ProductListItem } from "@/types";
import { SearchBar } from "./SearchBar";
import { SortSelect } from "./SortSelect";
import { ViewToggle, type ViewMode } from "./ViewToggle";
import { FilterSidebar } from "./FilterSidebar";
import { ActiveFilters } from "./ActiveFilters";
import { ProductGrid } from "./ProductGrid";
import { Pagination } from "./Pagination";

interface ProductsCatalogClientProps {
  categories: Category[];
  products: ProductListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  initialQuery?: string;
}

export function ProductsCatalogClient({
  categories,
  products,
  pagination,
  initialQuery = "",
}: ProductsCatalogClientProps) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner & Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Explore Products
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {pagination.total} {pagination.total === 1 ? "product" : "products"} available
          </p>
        </div>
      </div>

      {/* Toolbar: Search, Sort, View Toggle, Mobile Filter Trigger */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 max-w-md">
          <SearchBar initialQuery={initialQuery} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 lg:hidden dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <SlidersHorizontal className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Filters
          </button>

          {/* Sort Select */}
          <SortSelect />

          {/* View Mode Toggle (Grid/List) */}
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Active Filters Badges */}
      <ActiveFilters categories={categories} />

      {/* Main Grid: Sidebar + Products */}
      <div className="flex gap-8">
        {/* Desktop Sidebar & Mobile Drawer */}
        <FilterSidebar
          categories={categories}
          isMobileOpen={isMobileFilterOpen}
          onMobileClose={() => setIsMobileFilterOpen(false)}
        />

        {/* Product Cards Grid & Pagination */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} viewMode={viewMode} />
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
          />
        </div>
      </div>
    </div>
  );
}
