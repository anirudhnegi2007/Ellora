"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function Rating({
  rating,
  count,
  size = "md",
  showCount = true,
  className,
}: RatingProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center text-amber-500">
        <Star className={cn(sizeMap[size], "fill-current")} />
        <span className="text-xs font-medium ml-1 text-zinc-700 dark:text-zinc-300">
          {rating > 0 ? rating.toFixed(1) : "New"}
        </span>
      </div>
      {showCount && count !== undefined && count > 0 && (
        <span className="text-xs text-zinc-500">({count})</span>
      )}
    </div>
  );
}
