"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, RefreshCw, CheckCircle2 } from "lucide-react";

interface OrderItemData {
  id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    image: string;
  };
}

interface OrderData {
  id: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  email: string;
  total: number;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  items: OrderItemData[];
}

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error("Failed to load merchant orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );
        setMessage(`Status updated to ${newStatus}`);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Vendor Orders</h1>
          <p className="text-slate-400 text-sm mt-1">
            Orders containing your listed vendor items. Update order statuses when items are shipped or delivered.
          </p>
        </div>

        {message && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" /> Loading vendor orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No orders found for your vendor products yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {orders.map((order) => (
              <div key={order.id} className="p-6 space-y-4 hover:bg-slate-800/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-base">
                        Order #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Customer: <span className="text-slate-200 font-medium">{order.shippingName}</span> ({order.email})
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Shipping to: {order.shippingAddress}, {order.shippingCity} ({order.shippingZip})
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      disabled={updatingId === order.id}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold border bg-slate-900 border-slate-700 text-white focus:outline-none cursor-pointer"
                    >
                      <option value="PENDING">Status: PENDING</option>
                      <option value="CONFIRMED">Status: CONFIRMED</option>
                      <option value="SHIPPED">Status: SHIPPED</option>
                      <option value="DELIVERED">Status: DELIVERED</option>
                      <option value="CANCELLED">Status: CANCELLED</option>
                    </select>
                  </div>
                </div>

                {/* Items preview */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center gap-3 overflow-x-auto">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/50 text-xs shrink-0"
                    >
                      <span className="font-semibold text-slate-300">
                        {item.product?.name || "Product"}
                      </span>
                      <span className="text-slate-500">x{item.quantity}</span>
                      <span className="font-medium text-purple-300">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
