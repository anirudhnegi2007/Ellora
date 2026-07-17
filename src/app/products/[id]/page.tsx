"use client";

import React, { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: PageProps) {
  // Unwrap params using React.use() (Next.js 15 client-side standard)
  const { id } = React.use(params);
  const product = PRODUCTS.find((p) => p.id === id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    notFound();
  }

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-zinc-500 dark:text-zinc-400">
          <li>
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Home
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <span>/</span>
            <span className="font-medium text-zinc-900 dark:text-white">{product.name}</span>
          </li>
        </ol>
      </nav>

      {/* Main product layout */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
        {/* Left Column: Image */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 aspect-square relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Right Column: Info */}
        <div className="flex flex-col">
          <div className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
              {product.category}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">${product.price.toFixed(2)}</p>

            {/* Ratings */}
            <div className="mt-4 flex items-center gap-1.5">
              <div className="flex items-center text-amber-500">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium ml-1 text-zinc-700 dark:text-zinc-300">
                  {product.rating.rate} / 5.0
                </span>
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-500">
                ({product.rating.count} verified reviews)
              </span>
            </div>
          </div>

          {/* Description & Specs */}
          <div className="py-6 border-b border-zinc-200 dark:border-zinc-800 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Description</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {product.description}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Highlights</h3>
              <ul className="mt-2 list-disc list-inside space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                {product.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between border border-zinc-200 rounded-lg h-12 w-32 px-3 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <button
                  onClick={handleDecrement}
                  className="p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  aria-label="Decrease quantity"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  aria-label="Increase quantity"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={() => {
                  addToCart(product, quantity);
                  setQuantity(1); // Reset quantity selector
                }}
                className="flex-1 h-12 flex items-center justify-center rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
