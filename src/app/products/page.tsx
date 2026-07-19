/**
 * Product Listing Page (PLP)
 *
 * Architecture: Server Component
 * Responsibility: Read URL search params → call service → pass data to UI components.
 *
 * This page intentionally contains ZERO business logic.
 * All query construction, Prisma calls, and data mapping live in
 * services/product.service.ts, keeping this file a thin orchestration layer.
 *
 * URL Search Parameter contract (current + future):
 * ┌────────────┬──────────────────────────────────────────────────────┐
 * │ Param      │ Purpose                                              │
 * ├────────────┼──────────────────────────────────────────────────────┤
 * │ q          │ Full-text search query (debounced in SearchBar)      │
 * │ category   │ Filter by category slug                              │
 * │ minPrice   │ Minimum price filter                                 │
 * │ maxPrice   │ Maximum price filter                                 │
 * │ minRating  │ Minimum star rating filter                           │
 * │ sort       │ Sort order (newest | price-asc | price-desc | etc.)  │
 * │ page       │ Pagination cursor                                    │
 * └────────────┴──────────────────────────────────────────────────────┘
 *
 * Step 2 will add: category sidebar, price range slider, sort dropdown.
 * Step 3 will add: pagination controls using pagination data from service.
 */

import { Suspense } from "react";
import type { Metadata } from "next";

import { getProducts } from "@/services/product.service";
import { productSearchSchema } from "@/validations/product.schema";

import { SearchBar } from "@/features/products/components/SearchBar";
import { ProductGrid } from "@/features/products/components/ProductGrid";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Products | Ellora",
  description:
    "Browse our full collection of premium products. Filter by category, price, and rating.",
};

// ---------------------------------------------------------------------------
// Page Props
// ---------------------------------------------------------------------------

/**
 * Next.js App Router passes raw URL search params as Record<string, string | string[]>.
 * We validate and coerce them via productSearchSchema before passing to the service.
 */
interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // 1. Await and flatten searchParams (Next.js 15 async searchParams)
  const rawParams = await searchParams;

  // 2. Validate and coerce raw URL strings into typed ProductSearchInput.
  //    productSearchSchema handles coercion (e.g. "2" → 2) and applies
  //    sensible defaults (sort: "newest", page: 1, limit: 12).
  //    Invalid or missing params are safely stripped / defaulted.
  const parsed = productSearchSchema.safeParse(rawParams);
  const searchInput = parsed.success ? parsed.data : productSearchSchema.parse({});

  // 3. Delegate all data fetching to the service layer.
  //    This call will later be enhanced with React cache() for deduplication.
  const { data: products, pagination } = await getProducts(searchInput);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          All Products
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {pagination.total} items available
        </p>
      </div>

      {/* 
        Toolbar: SearchBar + (future) sort dropdown + filter toggles.
        SearchBar is a Client Component — it reads/writes URL params on
        the client side so the Server Component page re-fetches automatically.
      */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* 
          Pass the current ?q= value so the input is hydrated correctly
          after the server re-render. Without this, the input would reset
          to empty on every navigation.
        */}
        <SearchBar initialQuery={searchInput.q ?? ""} />

        {/* 
          TODO (Step 2): Sort dropdown (<SortSelect />) goes here.
          It will also be a Client Component using useRouter + useSearchParams.
        */}
      </div>

      {/* 
        TODO (Step 2): Sidebar layout with <FilterPanel /> 
        Currently renders full-width; will shift to a sidebar + main grid layout.
      */}

      {/*
        Suspense boundary lets Next.js stream the page shell immediately
        while the product grid is being fetched. Replace the fallback with
        a <ProductGridSkeleton /> in Step 2.
      */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: searchInput.limit }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        }
      >
        {/* 
          ProductGrid is a Server Component — it receives data and renders cards.
          No client-side data fetching happens here.
        */}
        <ProductGrid products={products} />
      </Suspense>

      {/* TODO (Step 3): <Pagination /> component using pagination.totalPages */}
    </main>
  );
}
