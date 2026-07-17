import { db } from "@/lib/db";
import type { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
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
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
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
}
