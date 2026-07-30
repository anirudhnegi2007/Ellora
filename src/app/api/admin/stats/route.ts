import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/rbac";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const [
      totalUsers,
      totalMerchants,
      totalAdmins,
      totalProducts,
      totalCategories,
      orders,
    ] = await Promise.all([
      db.user.count({ where: { role: "USER" } }),
      db.user.count({ where: { role: "MERCHANT" } }),
      db.user.count({ where: { role: "ADMIN" } }),
      db.product.count(),
      db.category.count(),
      db.order.findMany({
        select: {
          id: true,
          total: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
    ]);

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED" || o.status === "CONFIRMED")
      .reduce((acc, o) => acc + o.total, 0);

    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    const completedOrders = orders.filter((o) => o.status === "DELIVERED").length;

    // Recent 5 orders
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        shippingName: true,
        email: true,
        total: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalMerchants,
        totalAdmins,
        totalProducts,
        totalCategories,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        completedOrders,
      },
      recentOrders,
    });
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
