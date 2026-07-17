"use client";

import { useState, useEffect } from "react";
import type { ProductListItem, PaginatedResponse } from "@/types";
import type { ProductSearchInput } from "@/validations/product.schema";

async function fetchProducts(
  params: ProductSearchInput
): Promise<PaginatedResponse<ProductListItem>> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const res = await fetch(`/api/products?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export function useProducts(params: ProductSearchInput) {
  const [data, setData] = useState<PaginatedResponse<ProductListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchProducts(params)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    params.q,
    params.category,
    params.minPrice,
    params.maxPrice,
    params.minRating,
    params.sort,
    params.page,
    params.limit,
  ]);

  return { data, isLoading, error };
}
