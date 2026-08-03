"use client";

import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900">
      <button
        onClick={() => onChange("grid")}
        aria-label="Grid View"
        title="Grid View"
        className={`rounded-md p-1.5 transition-colors ${
          mode === "grid"
            ? "bg-zinc-100 text-indigo-600 dark:bg-zinc-800 dark:text-indigo-400"
            : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange("list")}
        aria-label="List View"
        title="List View"
        className={`rounded-md p-1.5 transition-colors ${
          mode === "list"
            ? "bg-zinc-100 text-indigo-600 dark:bg-zinc-800 dark:text-indigo-400"
            : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        }`}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
