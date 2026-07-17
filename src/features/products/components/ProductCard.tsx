"use client";

import Link from "next/link";
import Image from "next/image";
import type { ProductListItem } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Rating } from "@/components/shared/Rating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square w-full overflow-hidden bg-zinc-100"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3">{product.category.name}</Badge>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-1">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {product.name}
          </Link>
        </h3>

        <Rating
          rating={product.rating.rate}
          count={product.rating.count}
          className="mt-2"
        />

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            onClick={() => addToCart(product, 1)}
            disabled={product.inventory <= 0}
          >
            {product.inventory <= 0 ? "Out of Stock" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}
