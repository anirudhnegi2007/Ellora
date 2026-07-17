import { handleApiError } from "@/lib/errors";
import { validateCoupon } from "@/services/order.service";
import { couponSchema } from "@/validations/order.schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = couponSchema.parse(body);
    const result = await validateCoupon(code, subtotal);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
