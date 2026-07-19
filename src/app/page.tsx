import Link from "next/link";
import { getFeaturedProducts } from "@/services/product.service";
import { ProductCard } from "@/features/products/components/ProductCard";

export default async function Home() {
  // Fetch featured products from the database via the service layer
  const products = await getFeaturedProducts(8);

  // Derive unique categories from the fetched products
  const categories = Array.from(
    new Map(products.map((p) => [p.category.slug, p.category])).values()
  );

  return (
    <div className="w-full pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-900 text-white py-24 sm:py-32">
        <div className="absolute inset-0 opacity-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80"
            alt="Hero background"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900/80 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-start gap-6 max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
            Summer Collection 2026
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
            Elevate Your <br />
            Daily Essentials
          </h1>
          <p className="text-lg text-zinc-300">
            Discover a curated collection of handcrafted bags, high-performance
            electronics, and premium lifestyle accessories.
          </p>
          <div className="flex gap-4 mt-2">
            <Link
              href="/products"
              className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              Shop Collection
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-zinc-500 px-6 py-3 text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
            >
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* Category Section */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
            Browse by Category
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="group relative flex h-24 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="absolute inset-0 bg-indigo-500/0 transition-colors group-hover:bg-indigo-500/5" />
                <span className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-50 dark:group-hover:text-indigo-400 transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section id="products" className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
              Featured Products
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Our top picks for design, build quality, and functionality.
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            View all &rarr;
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="mt-8 text-center py-16 text-zinc-500 dark:text-zinc-400">
            <p>No products yet. Add some products to your database to get started.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
