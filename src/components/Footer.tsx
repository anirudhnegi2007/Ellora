'use client';

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              E<span className="text-indigo-600 dark:text-indigo-400">llora</span>
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your destination for curated high-quality electronics, clothing, and accessories.
            </p>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
              Shop
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/products?category=electronics"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=clothing"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Clothing
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=accessories"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
              Support
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                  Contact Us
                </span>
              </li>
              <li>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                  Shipping Policy
                </span>
              </li>
              <li>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
              Stay Updated
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder="Enter email"
                className="w-full min-w-0 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-indigo-400"
              />
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} Ellora Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
