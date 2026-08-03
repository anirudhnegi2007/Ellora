"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  initialQuery?: string;
}

export function SearchBar({ initialQuery = "" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentQ = params.get("q") ?? "";

    if (debouncedValue !== currentQ) {
      if (debouncedValue) {
        params.set("q", debouncedValue);
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.push(`/products?${params.toString()}`);
    }
  }, [debouncedValue, router, searchParams]);

  const handleClear = () => {
    setValue("");
  };

  return (
    <div className="relative w-full max-w-md">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
        <Search className="h-4 w-4" />
      </span>

      <input
        id="product-search"
        type="search"
        role="searchbox"
        aria-label="Search products"
        placeholder="Search by product name, description…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="
          w-full rounded-lg border border-zinc-200 bg-white
          py-2.5 pl-10 pr-9 text-sm text-zinc-900
          placeholder-zinc-400 shadow-sm
          transition-colors
          focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30
          dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50
          dark:placeholder-zinc-500 dark:focus:border-indigo-400
        "
      />

      {value && (
        <button
          onClick={handleClear}
          aria-label="Clear search query"
          className="absolute inset-y-0 right-2.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
