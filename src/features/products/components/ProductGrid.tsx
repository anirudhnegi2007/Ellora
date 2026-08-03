"use client";

import type { ProductListItem } from "@/types";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchX } from "lucide-react";

interface ProductGridProps {
  products: ProductListItem[];
  viewMode?: "grid" | "list";
}

export function ProductGrid({ products, viewMode = "grid" }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="h-12 w-12 text-zinc-400" />}
        title="No products found"
        description="Try adjusting your search query, price range, or filter options."
      />
    );
  }

  return (
    <section aria-label="Product listing">
      <div
        className={
          viewMode === "list"
            ? "flex flex-col gap-4"
            : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        }
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} viewMode={viewMode} />
        ))}
      </div>
    </section>
  );
}
