import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/services/product.service";
import { ProductCard } from "@/features/products/components/ProductCard";
import { AddToCartButton } from "@/features/products/components/AddToCartButton";
import { formatPrice } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductBySlug(id);
  if (!product) return { title: "Product Not Found | Ellora" };
  return {
    title: `${product.name} | Ellora`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: PageProps) {
  // The dynamic segment [id] is used as a slug (e.g. /products/my-product-slug)
  const { id: slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.category.id, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-zinc-500 dark:text-zinc-400">
          <li>
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Home
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <span>/</span>
            <Link
              href="/products"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Products
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <span>/</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {product.category.name}
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <span>/</span>
            <span className="font-medium text-zinc-900 dark:text-white truncate max-w-[200px]">
              {product.name}
            </span>
          </li>
        </ol>
      </nav>

      {/* Main product layout */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
        {/* Left Column: Image */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 aspect-square relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Right Column: Info */}
        <div className="flex flex-col">
          <div className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
            {/* Category badge */}
            <Link
              href={`/products?category=${product.category.slug}`}
              className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
            >
              {product.category.name}
            </Link>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">
              {formatPrice(product.price)}
            </p>

            {/* Ratings */}
            {product.rating.count > 0 && (
              <div className="mt-4 flex items-center gap-1.5">
                <div className="flex items-center text-amber-500">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium ml-1 text-zinc-700 dark:text-zinc-300">
                    {product.rating.rate} / 5.0
                  </span>
                </div>
                <span className="text-sm text-zinc-500 dark:text-zinc-500">
                  ({product.rating.count} verified reviews)
                </span>
              </div>
            )}

            {/* Stock badge */}
            <div className="mt-3">
              {product.inventory > 0 ? (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  In Stock ({product.inventory} available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Description & Specs */}
          <div className="py-6 border-b border-zinc-200 dark:border-zinc-800 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
                Description
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {product.description}
              </p>
            </div>

            {product.details && product.details.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Highlights
                </h3>
                <ul className="mt-2 list-disc list-inside space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                  {product.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Add to Cart — Client Component handles the interaction */}
          <div className="pt-6">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            You might also like
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
