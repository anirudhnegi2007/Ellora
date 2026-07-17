import { db } from "@/lib/db";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import type { ProductSearchInput } from "@/validations/product.schema";
import type { Product, ProductListItem, PaginatedResponse } from "@/types";

function computeRating(reviews: { rating: number }[]): { rate: number; count: number } {
  if (reviews.length === 0) return { rate: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { rate: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}

function mapProductListItem(
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    inventory: number;
    category: { id: string; name: string; slug: string };
    reviews: { rating: number }[];
  }
): ProductListItem {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.image,
    inventory: product.inventory,
    category: product.category,
    rating: computeRating(product.reviews),
  };
}

function mapProduct(
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    image: string;
    details: string[];
    inventory: number;
    createdAt: Date;
    category: { id: string; name: string; slug: string };
    reviews: { rating: number }[];
    variants?: {
      id: string;
      name: string;
      sku: string;
      price: number | null;
      inventory: number;
    }[];
  }
): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    image: product.image,
    details: product.details,
    inventory: product.inventory,
    category: product.category,
    rating: computeRating(product.reviews),
    variants: product.variants,
    createdAt: product.createdAt.toISOString(),
  };
}

export async function getProducts(
  params: ProductSearchInput
): Promise<PaginatedResponse<ProductListItem>> {
  const { q, category, minPrice, maxPrice, minRating, sort, page, limit } = params;
  const take = limit ?? PRODUCTS_PER_PAGE;
  const skip = ((page ?? 1) - 1) * take;

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined && { gte: minPrice }),
      ...(maxPrice !== undefined && { lte: maxPrice }),
    };
  }

  const orderBy = (() => {
    switch (sort) {
      case "price-asc":
        return { price: "asc" as const };
      case "price-desc":
        return { price: "desc" as const };
      case "name":
        return { name: "asc" as const };
      case "newest":
      default:
        return { createdAt: "desc" as const };
    }
  })();

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: { select: { rating: true } },
      },
    }),
    db.product.count({ where }),
  ]);

  let mapped = products.map(mapProductListItem);

  if (minRating) {
    mapped = mapped.filter((p) => p.rating.rate >= minRating);
  }

  if (sort === "rating") {
    mapped.sort((a, b) => b.rating.rate - a.rating.rate);
  }

  return {
    data: mapped,
    pagination: {
      page: page ?? 1,
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: { select: { rating: true } },
      variants: true,
    },
  });

  return product ? mapProduct(product) : null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: { select: { rating: true } },
      variants: true,
    },
  });

  return product ? mapProduct(product) : null;
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4
): Promise<ProductListItem[]> {
  const products = await db.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
    },
    take: limit,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: { select: { rating: true } },
    },
  });

  return products.map(mapProductListItem);
}

export async function getFeaturedProducts(limit = 6): Promise<ProductListItem[]> {
  const products = await db.product.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: { select: { rating: true } },
    },
  });

  return products.map(mapProductListItem);
}

export async function getAllProductSlugs(): Promise<{ slug: string }[]> {
  return db.product.findMany({ select: { slug: true } });
}
