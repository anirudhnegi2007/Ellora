import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { DollarSign, Package, ShoppingBag, AlertTriangle, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function MerchantDashboardPage() {
  const user = await requireRole(["MERCHANT", "ADMIN"]);

  const productWhere = user.role === "ADMIN" ? {} : { merchantId: user.id };

  const products = await db.product.findMany({
    where: productWhere,
    select: { id: true, name: true, price: true, inventory: true, slug: true, image: true },
  });

  const productIds = products.map((p) => p.id);

  const orderItems = await db.orderItem.findMany({
    where: { productId: { in: productIds } },
    include: {
      order: { select: { id: true, status: true, createdAt: true, shippingName: true } },
      product: { select: { name: true, image: true } },
    },
    orderBy: { id: "desc" },
  });

  const totalRevenue = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalUnitsSold = orderItems.reduce((acc, item) => acc + item.quantity, 0);
  const lowStockProducts = products.filter((p) => p.inventory < 10);

  const stats = [
    {
      label: "Vendor Sales Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      change: "Gross revenue",
      icon: DollarSign,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      label: "Products Listed",
      value: products.length.toString(),
      change: `${lowStockProducts.length} low stock alerts`,
      icon: Package,
      color: "from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30",
    },
    {
      label: "Units Sold",
      value: totalUnitsSold.toString(),
      change: `${orderItems.length} total items ordered`,
      icon: ShoppingBag,
      color: "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Merchant Portal</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your store inventory, track product sales, and process customer orders.
          </p>
        </div>

        <Link
          href="/merchant/products"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
              <div className="text-xs text-slate-400 mt-1">{stat.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Vendor Orders */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Recent Vendor Orders</h2>
            <Link
              href="/merchant/orders"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              View Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orderItems.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No product orders recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {orderItems.slice(0, 6).map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-purple-300 overflow-hidden">
                      {item.product?.image ? (
                        <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        item.product?.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">{item.product?.name}</p>
                      <p className="text-xs text-slate-500">
                        Qty: {item.quantity} • Customer: {item.order.shippingName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-white">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Low Stock Alerts
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
              {lowStockProducts.length} items
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-slate-500 text-xs py-6 text-center">All inventory levels are healthy.</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-200 truncate max-w-[140px]">{p.name}</span>
                  <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                    {p.inventory} left
                  </span>
                </div>
              ))}
              <Link
                href="/merchant/products"
                className="block text-center text-xs font-semibold text-purple-400 hover:text-purple-300 pt-2"
              >
                Update Stock Counts →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
