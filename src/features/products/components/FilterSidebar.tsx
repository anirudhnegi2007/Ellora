"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, Filter, RotateCcw, Check, DollarSign, X } from "lucide-react";
import type { Category } from "@/types";

interface FilterSidebarProps {
  categories: Category[];
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function FilterSidebar({
  categories,
  isMobileOpen = false,
  onMobileClose,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active parameter values from URL
  const activeCategory = searchParams.get("category") || "";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";
  const activeMinRating = searchParams.get("minRating") || "";
  const activeInStock = searchParams.get("inStock") === "true";

  // Local state for price range inputs
  const [minPrice, setMinPrice] = useState(activeMinPrice);
  const [maxPrice, setMaxPrice] = useState(activeMaxPrice);

  useEffect(() => {
    setMinPrice(activeMinPrice);
    setMaxPrice(activeMaxPrice);
  }, [activeMinPrice, activeMaxPrice]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset page when filter changes
    router.push(`/products?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const handlePricePreset = (min: number | null, max: number | null) => {
    setMinPrice(min !== null ? String(min) : "");
    setMaxPrice(max !== null ? String(max) : "");

    const params = new URLSearchParams(searchParams.toString());
    if (min !== null) params.set("minPrice", String(min));
    else params.delete("minPrice");

    if (max !== null) params.set("maxPrice", String(max));
    else params.delete("maxPrice");

    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    setMinPrice("");
    setMaxPrice("");
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const hasActiveFilters =
    Boolean(activeCategory) ||
    Boolean(activeMinPrice) ||
    Boolean(activeMaxPrice) ||
    Boolean(activeMinRating) ||
    activeInStock;

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            Filters
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      {/* 1. Category Filter */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Category
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParam("category", null)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
              !activeCategory
                ? "bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => updateParam("category", cat.slug)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
                }`}
              >
                <span>{cat.name}</span>
                {cat.productCount !== undefined && (
                  <span className="text-xs opacity-60">({cat.productCount})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Price Range */}
      <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Price Range
        </h3>

        {/* Quick Presets */}
        <div className="mb-4 grid grid-cols-2 gap-1.5">
          {[
            { label: "Under $50", min: null, max: 50 },
            { label: "$50 – $100", min: 50, max: 100 },
            { label: "$100 – $200", min: 100, max: 200 },
            { label: "$200+", min: 200, max: null },
          ].map((preset, idx) => {
            const isPresetActive =
              (preset.min === null ? !activeMinPrice : activeMinPrice === String(preset.min)) &&
              (preset.max === null ? !activeMaxPrice : activeMaxPrice === String(preset.max));
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePricePreset(preset.min, preset.max)}
                className={`rounded-md border py-1 px-2 text-xs font-medium transition-colors ${
                  isPresetActive
                    ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Price Inputs */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
              $
            </span>
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-6 pr-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <span className="text-zinc-400 text-xs">to</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
              $
            </span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-6 pr-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <button
            type="button"
            onClick={applyPriceFilter}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Go
          </button>
        </div>
      </div>

      {/* 3. Minimum Rating Filter */}
      <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Rating
        </h3>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((stars) => {
            const isActive = activeMinRating === String(stars);
            return (
              <button
                key={stars}
                onClick={() =>
                  updateParam("minRating", isActive ? null : String(stars))
                }
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-amber-50 font-semibold text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < stars ? "fill-amber-400" : "text-zinc-200 dark:text-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium">& Up</span>
                </div>
                {isActive && <Check className="h-4 w-4 text-amber-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Availability Filter */}
      <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Availability
        </h3>
        <label className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={activeInStock}
            onChange={(e) =>
              updateParam("inStock", e.target.checked ? "true" : null)
            }
            className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">{content}</aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          {/* Panel */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                Filter Products
              </span>
              <button
                onClick={onMobileClose}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
