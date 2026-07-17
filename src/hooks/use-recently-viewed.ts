"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "recently-viewed";
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecentIds(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
  }, []);

  const addRecentlyViewed = useCallback((productId: string) => {
    setRecentIds((prev) => {
      const updated = [productId, ...prev.filter((id) => id !== productId)].slice(
        0,
        MAX_ITEMS
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { recentIds, addRecentlyViewed };
}
