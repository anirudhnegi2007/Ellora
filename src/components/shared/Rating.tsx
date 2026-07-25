"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
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
  interactive = false,
  onRatingChange,
  className,
}: RatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = displayRating >= starIndex;
          const isHalf = displayRating >= starIndex - 0.5 && displayRating < starIndex;

          return (
            <button
              key={starIndex}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange?.(starIndex)}
              onMouseEnter={() => interactive && setHoverRating(starIndex)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={cn(
                "p-0.5 transition-transform duration-150 focus:outline-none",
                interactive ? "cursor-pointer hover:scale-125" : "cursor-default"
              )}
              aria-label={`Rate ${starIndex} out of 5 stars`}
            >
              <Star
                className={cn(
                  sizeMap[size],
                  isFilled || isHalf
                    ? "fill-amber-400 text-amber-400 dark:fill-amber-400 dark:text-amber-400"
                    : "fill-zinc-200 text-zinc-300 dark:fill-zinc-800 dark:text-zinc-700"
                )}
              />
            </button>
          );
        })}
      </div>

      {!interactive && (
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-0.5">
          {rating > 0 ? rating.toFixed(1) : "New"}
        </span>
      )}

      {showCount && count !== undefined && count > 0 && !interactive && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">({count})</span>
      )}
    </div>
  );
}
