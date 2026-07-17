import { handleApiError } from "@/lib/errors";
import { getProducts } from "@/services/product.service";
import { productSearchSchema } from "@/validations/product.schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = productSearchSchema.parse(Object.fromEntries(searchParams));
    const result = await getProducts(params);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
