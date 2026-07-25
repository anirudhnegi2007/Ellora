import { cache } from "react";
import { db } from "@/lib/db";
import type { Category } from "@/types";

export const getCategories = cache(async function (): Promise<Category[]> {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    productCount: c._count.products,
  }));
});

export const getCategoryBySlug = cache(async function (
  slug: string
): Promise<Category | null> {
  const category = await db.category.findUnique({
    where: { slug },
    include: { _count: { select: { products: true } } },
  });

  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image,
    productCount: category._count.products,
  };
});
