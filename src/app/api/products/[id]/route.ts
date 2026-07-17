import { handleApiError, notFound } from "@/lib/errors";
import { getProductById } from "@/services/product.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) throw notFound("Product not found");
    return Response.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}
