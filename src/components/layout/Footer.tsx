import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              E<span className="text-indigo-600 dark:text-indigo-400">llora</span>
            </span>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your destination for curated high-quality electronics, clothing, and accessories.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
              Shop
            </h3>
            <ul className="mt-4 space-y-2">
              {["electronics", "clothing", "accessories", "bags"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/products?category=${cat}`}
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 capitalize"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
              Support
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Contact Us</span>
              </li>
              <li>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Shipping Policy</span>
              </li>
              <li>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Privacy Policy</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
              Stay Updated
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Subscribe for special offers and new arrivals.
            </p>
            <form className="flex max-w-md gap-2">
              <Input type="email" required placeholder="Enter email" />
              <Button type="submit">Join</Button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center">
            &copy; {new Date().getFullYear()} Ellora Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
