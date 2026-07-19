/**
 * SearchBar — Placeholder
 *
 * Responsibility: Provide a controlled search input that syncs
 * its value to the URL query string (?q=...) without causing full
 * page navigations, leveraging debounce to avoid excessive route updates.
 *
 * Current state: Static UI shell only. No logic implemented yet.
 *
 * Planned integrations (Step 2):
 * - Read initial value from `searchParams.q` passed as a prop
 * - Use the `useDebounce` hook from @/hooks/use-debounce
 * - Use Next.js `useRouter` + `useSearchParams` to push URL updates
 * - Trigger URL update after debounce delay (e.g. 400ms)
 *
 * Why "use client"?
 * Search input requires browser interactivity (onChange, useRouter),
 * so this must be a Client Component even though the parent page is a
 * Server Component.
 */

"use client";

interface SearchBarProps {
  /**
   * The initial search query read from the URL (?q=...).
   * Passed down from the Server Component page to hydrate the input.
   */
  initialQuery?: string;
}

export function SearchBar({ initialQuery = "" }: SearchBarProps) {
  // TODO (Step 2): wire up useDebounce + useRouter + useSearchParams
  return (
    <div className="relative w-full max-w-md">
      {/* Search icon */}
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
      </span>

      <input
        id="product-search"
        type="search"
        role="searchbox"
        aria-label="Search products"
        placeholder="Search products…"
        defaultValue={initialQuery}
        className="
          w-full rounded-lg border border-zinc-200 bg-white
          py-2.5 pl-10 pr-4 text-sm text-zinc-900
          placeholder-zinc-400 shadow-sm
          transition-colors
          focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30
          dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50
          dark:placeholder-zinc-500 dark:focus:border-indigo-400
        "
      />
    </div>
  );
}
