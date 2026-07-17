"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { cart, totalPrice, totalItems, clearCart } = useCart();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    zip: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    clearCart();
  };

  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-emerald-100 p-6 dark:bg-emerald-950">
          <svg
            className="h-12 w-12 text-emerald-600 dark:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Order Confirmed!</h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
          Thank you for your purchase. We&apos;ve sent a confirmation email to{" "}
          <span className="font-semibold text-zinc-900 dark:text-white">{formData.email || "your email"}</span>. Your mock order ID is #{(Math.floor(Math.random() * 90000) + 10000)}.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          Back to Homepage
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Checkout is empty</h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Please add items to your cart before checking out.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          Shop Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-12 items-start">
        {/* Billing / Shipping Details Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Contact & Shipping Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Postal Code</label>
                <input
                  type="text"
                  name="zip"
                  required
                  value={formData.zip}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  required
                  placeholder="0000 0000 0000 0000"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Expiration Date</label>
                <input
                  type="text"
                  name="expiry"
                  required
                  placeholder="MM/YY"
                  value={formData.expiry}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">CVC</label>
                <input
                  type="text"
                  name="cvc"
                  required
                  placeholder="123"
                  value={formData.cvc}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Sidebar */}
        <div className="lg:col-span-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Your Order</h2>

          {/* Cart items list */}
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-60 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.product.id} className="flex py-3 items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-12 w-12 rounded object-cover border border-zinc-200 dark:border-zinc-800"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{item.product.name}</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800 text-sm">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Subtotal</span>
              <span className="font-semibold text-zinc-900 dark:text-white">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Shipping</span>
              <span className="font-semibold text-zinc-900 dark:text-white">Free</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-zinc-900 dark:text-white">${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between text-base font-bold text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            className="w-full mt-6 h-12 flex items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
          >
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
}
