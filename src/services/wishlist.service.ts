import { db } from "@/lib/db";
import { conflict, notFound, unauthorized } from "@/lib/errors";
import type { WishlistItem } from "@/types";

function mapWishlistItem(item: {
  id: string;
  productId: string;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    category: { name: string; slug: string };
    reviews: { rating: number }[];
  };
}): WishlistItem {
  const ratingCount = item.product.reviews.length;
  const ratingSum = item.product.reviews.reduce((s, r) => s + r.rating, 0);

  return {
    id: item.id,
    productId: item.productId,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      image: item.product.image,
      category: item.product.category,
      rating: {
        rate: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
        count: ratingCount,
      },
    },
    createdAt: item.createdAt.toISOString(),
  };
}

const wishlistInclude = {
  product: {
    include: {
      category: { select: { name: true, slug: true } },
      reviews: { select: { rating: true } },
    },
  },
} as const;

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  const items = await db.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: wishlistInclude,
  });

  return items.map(mapWishlistItem);
}

function generateObjectId(): string {
  const chars = "abcdef0123456789";
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function addToWishlist(
  userId: string,
  productId: string
): Promise<WishlistItem> {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) throw notFound("Product not found");

  const existing = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) throw conflict("Product already in wishlist");

  const item = await db.wishlistItem.create({
    data: {
      id: generateObjectId(),
      userId,
      productId,
    },
    include: wishlistInclude,
  });

  return mapWishlistItem(item);
}

export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<void> {
  const item = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (!item) throw notFound("Wishlist item not found");

  await db.wishlistItem.delete({ where: { id: item.id } });
}

export async function isInWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const item = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  return !!item;
}

export async function getWishlistProductIds(userId: string): Promise<string[]> {
  const items = await db.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });

  return items.map((i) => i.productId);
}
