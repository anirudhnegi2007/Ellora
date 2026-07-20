"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="relative block aspect-square w-full overflow-hidden bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-zinc-900 shadow-sm dark:bg-zinc-950/90 dark:text-zinc-50">
          {product.category}
        </span>
      </Link>

      {/* Info Container */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-1">
          <Link href={`/products/${product.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {product.name}
          </Link>
        </h3>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center text-amber-500">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-medium ml-1 text-zinc-700 dark:text-zinc-300">
              {product.rating.rate}
            </span>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            ({product.rating.count})
          </span>
        </div>

        {/* Description */}
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
          {product.description}
        </p>

        {/* Price & Action */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={() => addToCart(product as any, 1)}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
