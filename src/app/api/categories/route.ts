import { handleApiError } from "@/lib/errors";
import { getCategories } from "@/services/category.service";

export async function GET() {
  try {
    const categories = await getCategories();
    return Response.json(categories);
  } catch (error) {
    return handleApiError(error);
  }
}
