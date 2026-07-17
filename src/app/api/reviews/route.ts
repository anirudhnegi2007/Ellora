import { handleApiError, unauthorized } from "@/lib/errors";
import { getSession } from "@/lib/session";
import { getReviewsByProduct, createReview } from "@/services/review.service";
import { createReviewSchema } from "@/validations/product.schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      return Response.json({ error: "productId is required" }, { status: 400 });
    }
    const reviews = await getReviewsByProduct(productId);
    return Response.json(reviews);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) throw unauthorized();

    const body = await request.json();
    const input = createReviewSchema.parse(body);
    const review = await createReview(input, session.user.id);
    return Response.json(review, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
