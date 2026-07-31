import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/rbac";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "MERCHANT" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // Get products belonging to merchant (or all if admin viewing)
    const productWhere = user.role === "ADMIN" ? {} : { merchantId: user.id };

    const merchantProducts = await db.product.findMany({
      where: productWhere,
      select: { id: true, name: true, price: true, inventory: true },
    });

    const productIds = merchantProducts.map((p) => p.id);

    // Get order items for merchant products
    const orderItems = await db.orderItem.findMany({
      where: { productId: { in: productIds } },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
            shippingName: true,
          },
        },
        product: { select: { name: true, image: true } },
      },
      orderBy: { id: "desc" },
    });

    const totalRevenue = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalUnitsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockProducts = merchantProducts.filter((p) => p.inventory < 10);

    return NextResponse.json({
      stats: {
        totalProducts: merchantProducts.length,
        totalRevenue,
        totalUnitsSold,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts,
      recentOrderItems: orderItems.slice(0, 10),
    });
  } catch (error: any) {
    console.error("Error fetching merchant stats:", error);
    return NextResponse.json({ error: "Failed to fetch merchant stats" }, { status: 500 });
  }
}
