import { db } from "@/lib/db";
import { DollarSign, Users, Store, ShoppingBag, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalMerchants,
    totalProducts,
    orders,
    recentOrders,
  ] = await Promise.all([
    db.user.count({ where: { role: "USER" } }),
    db.user.count({ where: { role: "MERCHANT" } }),
    db.product.count(),
    db.order.findMany({ select: { total: true, status: true, paymentStatus: true } }),
    db.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        shippingName: true,
        email: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED" || o.status === "CONFIRMED")
    .reduce((sum, o) => sum + o.total, 0);

  const stats = [
    {
      label: "Platform Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      change: "+14% this month",
      icon: DollarSign,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      label: "Registered Users",
      value: totalUsers.toString(),
      change: "Active Customers",
      icon: Users,
      color: "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30",
    },
    {
      label: "Active Merchants",
      value: totalMerchants.toString(),
      change: "Store Vendors",
      icon: Store,
      color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
    },
    {
      label: "Total Orders",
      value: orders.length.toString(),
      change: `${orders.filter((o) => o.status === "PENDING").length} Pending`,
      icon: ShoppingBag,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Overview</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Platform performance, revenue metrics, user management, and store vendors.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {stat.label}
              </span>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} border`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Panels & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Recent Platform Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No orders recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-3.5 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-slate-200">{order.shippingName}</p>
                    <p className="text-xs text-slate-500">{order.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : order.status === "SHIPPED"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="font-bold text-white">₹{order.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Management Shortcuts */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-2">Role Management</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Promote registered users to Merchant or Admin roles to grant store publishing or system management privileges.
            </p>
            <Link
              href="/admin/users"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30"
            >
              Manage Users & Roles
            </Link>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-2">Merchant Portal</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Manage product listings, set inventory counts, and fulfill orders assigned to store merchants.
            </p>
            <Link
              href="/merchant"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700"
            >
              Open Merchant Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
