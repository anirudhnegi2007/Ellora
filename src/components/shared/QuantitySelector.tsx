"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max,
  size = "md",
  className,
}: QuantitySelectorProps) {
  const height = size === "sm" ? "h-9" : "h-12";
  const width = size === "sm" ? "w-24" : "w-32";

  return (
    <div
      className={cn(
        "flex items-center justify-between border border-zinc-200 rounded-lg px-3 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        height,
        width,
        className
      )}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity <= min}
        className="p-1 text-zinc-500 hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:text-white"
        aria-label="Decrease quantity"
      >
        <Minus className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      </button>
      <span className="text-sm font-bold text-zinc-900 dark:text-white">{quantity}</span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={max !== undefined && quantity >= max}
        className="p-1 text-zinc-500 hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:text-white"
        aria-label="Increase quantity"
      >
        <Plus className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      </button>
    </div>
  );
}
