import { Suspense } from "react";
import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";

import { getProducts } from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import { productSearchSchema } from "@/validations/product.schema";
import { ProductsCatalogClient } from "@/features/products/components/ProductsCatalogClient";

export const metadata: Metadata = {
  title: "Search & Browse Products | Ellora",
  description:
    "Explore our full collection of products. Filter by category, price range, minimum rating, availability, and sort by price, rating, or date in ascending and descending order.",
};

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const rawParams = await searchParams;

  const parsed = productSearchSchema.safeParse(rawParams);
  const searchInput = parsed.success ? parsed.data : productSearchSchema.parse({});

  let products: any[] = [];
  let categories: any[] = [];
  let pagination = { total: 0, totalPages: 0, page: 1, limit: 12 };
  let errorMsg = "";

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      getProducts(searchInput),
      getCategories(),
    ]);
    products = productsRes.data;
    pagination = productsRes.pagination;
    categories = categoriesRes;
  } catch (err: any) {
    console.error("Failed to fetch products:", err);
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  return (
    <main className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950">
      {errorMsg && (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                  Database Connection Warning
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                  <p>
                    Ellora was unable to retrieve products from the database:
                  </p>
                  <p className="mt-2 text-xs font-mono opacity-80 bg-red-100/50 dark:bg-red-950/50 p-2 rounded">
                    {errorMsg}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
            <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
            <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded mb-8" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: searchInput.limit || 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 rounded-xl bg-zinc-200 dark:bg-zinc-800"
                />
              ))}
            </div>
          </div>
        }
      >
        <ProductsCatalogClient
          categories={categories}
          products={products}
          pagination={pagination}
          initialQuery={searchInput.q ?? ""}
        />
      </Suspense>
    </main>
  );
}
