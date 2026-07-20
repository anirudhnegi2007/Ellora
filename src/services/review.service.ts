import { db } from "@/lib/db";
import { conflict, notFound, unauthorized } from "@/lib/errors";
import type { CreateReviewInput } from "@/validations/product.schema";
import type { Review } from "@/types";

export async function getReviewsByProduct(productId: string): Promise<Review[]> {
  const reviews = await db.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    userId: r.userId,
    userName: r.user.name,
    productId: r.productId,
    createdAt: r.createdAt.toISOString(),
  }));
}

function generateObjectId(): string {
  const chars = "abcdef0123456789";
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function createReview(
  input: CreateReviewInput,
  userId: string
): Promise<Review> {
  const product = await db.product.findUnique({ where: { id: input.productId } });
  if (!product) throw notFound("Product not found");

  const existing = await db.review.findUnique({
    where: { userId_productId: { userId, productId: input.productId } },
  });

  if (existing) throw conflict("You have already reviewed this product");

  const review = await db.review.create({
    data: {
      id: generateObjectId(),
      rating: input.rating,
      comment: input.comment,
      userId,
      productId: input.productId,
    },
    include: { user: { select: { name: true } } },
  });

  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    userId: review.userId,
    userName: review.user.name,
    productId: review.productId,
    createdAt: review.createdAt.toISOString(),
  };
}

export async function deleteReview(reviewId: string, userId: string): Promise<void> {
  const review = await db.review.findUnique({ where: { id: reviewId } });
  if (!review) throw notFound("Review not found");
  if (review.userId !== userId) throw unauthorized("Cannot delete this review");

  await db.review.delete({ where: { id: reviewId } });
}
