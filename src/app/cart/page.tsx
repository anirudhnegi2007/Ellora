"use client";
// Cart page — client component because it reads from CartContext

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalPrice, totalItems, isHydrated } = useCart();

  const shipping: number = totalItems > 0 ? 0 : 0; // Free shipping
  const tax = totalPrice * 0.08; // 8% tax
  const grandTotal = totalPrice + shipping + tax;

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 w-full flex-grow flex flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-900">
          <ShoppingBag className="h-12 w-12 text-zinc-400" />
        </div>
        <h2 className="mt-6 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Your cart is empty</h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Shopping Cart</h1>

      <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-12 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Product Image */}
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 relative">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover object-center"
                />
              </div>

              {/* Product Details */}
              <div className="flex flex-grow flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                    <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    {typeof item.product.category === "string"
                      ? item.product.category
                      : item.product.category?.name ?? ""}
                  </p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">${item.product.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between border border-zinc-200 rounded-lg h-9 w-24 px-2 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-0.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-0.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:border-red-200 hover:text-red-600 transition-colors dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-red-950 dark:hover:text-red-400"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Order Summary</h2>

          <div className="space-y-2 border-b border-zinc-200 pb-4 dark:border-zinc-800 text-sm">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Subtotal</span>
              <span className="font-semibold text-zinc-900 dark:text-white">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Shipping</span>
              <span className="font-semibold text-zinc-900 dark:text-white">
                {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-zinc-900 dark:text-white">${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between text-base font-bold text-zinc-900 dark:text-white pt-2">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>

          <Link
            href="/checkout"
            className="w-full mt-6 h-12 flex items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
