import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/rbac";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "MERCHANT")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, image: true, merchantId: true } },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // If merchant, filter orders containing merchant's products
    const filteredOrders = user.role === "ADMIN" 
      ? orders 
      : orders.filter((o) => o.items.some((item) => item.product?.merchantId === user.id));

    return NextResponse.json({ orders: filteredOrders });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "MERCHANT")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status parameters" }, { status: 400 });
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ order: updatedOrder, message: `Order status updated to ${status}` });
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
