import { handleApiError, unauthorized } from "@/lib/errors";
import { getSession } from "@/lib/session";
import { createOrder } from "@/services/order.service";
import { checkoutSchema } from "@/validations/order.schema";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const input = checkoutSchema.parse(body);
    const order = await createOrder(input, session?.user?.id);
    return Response.json(order, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) throw unauthorized();

    const { getOrdersByUser } = await import("@/services/order.service");
    const orders = await getOrdersByUser(session.user.id);
    return Response.json(orders);
  } catch (error) {
    return handleApiError(error);
  }
}
