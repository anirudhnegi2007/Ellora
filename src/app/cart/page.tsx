"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  const shipping = totalItems > 0 ? 0 : 0; // Free shipping
  const tax = totalPrice * 0.08; // 8% tax
  const grandTotal = totalPrice + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-900">
          <svg
            className="h-12 w-12 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
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
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>

              {/* Product Details */}
              <div className="flex flex-grow flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                    <Link href={`/products/${item.product.id}`}>{item.product.name}</Link>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">{item.product.category}</p>
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
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-0.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                      aria-label="Increase quantity"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:border-red-200 hover:text-red-600 transition-colors dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-red-950 dark:hover:text-red-400"
                    aria-label="Remove item"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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
