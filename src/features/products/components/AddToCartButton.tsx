"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));
  const handleIncrement = () =>
    setQuantity((q) => (q < product.inventory ? q + 1 : q));

  const handleAdd = () => {
    addToCart(product, quantity);
    setQuantity(1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (product.inventory <= 0) {
    return (
      <button
        disabled
        className="w-full h-12 flex items-center justify-center rounded-lg bg-zinc-200 text-zinc-500 text-sm font-semibold cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500"
      >
        Out of Stock
      </button>
    );
  }

  return (
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

      {/* Add to Cart */}
      <button
        onClick={handleAdd}
        className={`flex-1 h-12 flex items-center justify-center rounded-lg px-8 py-3 text-sm font-semibold text-white transition-all shadow-sm ${
          added
            ? "bg-emerald-600 hover:bg-emerald-500"
            : "bg-indigo-600 hover:bg-indigo-500"
        }`}
      >
        {added ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Added to Cart
          </span>
        ) : (
          "Add to Cart"
        )}
      </button>
    </div>
  );
}
