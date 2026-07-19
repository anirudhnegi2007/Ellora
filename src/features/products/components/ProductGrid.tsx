/**
 * ProductGrid
 *
 * Responsibility: Render a responsive grid of ProductCard components.
 *
 * This component is intentionally kept pure — it receives data as props
 * and has zero knowledge of how that data was fetched or filtered.
 *
 * Future integrations:
 * - Loading skeleton state (pass `isLoading` prop)
 * - Pagination controls below the grid
 * - "No results" empty state tied to active search/filter params
 */

import type { ProductListItem } from "@/types";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/shared/EmptyState";

interface ProductGridProps {
  products: ProductListItem[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={
          <svg
            className="h-12 w-12 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        }
        title="No products found"
        description="Try adjusting your search or filters to find what you're looking for."
      />
    );
  }

  return (
    <section aria-label="Product listing">
      {/* Result count — will be driven by PaginatedResponse.pagination.total later */}
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        {products.length} {products.length === 1 ? "product" : "products"} found
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
