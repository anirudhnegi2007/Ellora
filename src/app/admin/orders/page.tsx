"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, RefreshCw, CheckCircle2, Clock, Truck, PackageCheck, XCircle } from "lucide-react";

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
  paymentStatus: string;
  createdAt: string;
  items: OrderItemData[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
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
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );
        setMessage(`Order updated to ${newStatus}`);
        setTimeout(() => setMessage(null), 3000);
      } else {
        alert(data.error || "Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Order Management & Fulfillment</h1>
          <p className="text-slate-400 text-sm mt-1">
            View orders, customer shipping details, and update fulfillment statuses.
          </p>
        </div>

        {message && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" /> Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No orders found in the system.
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
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Total Amount</p>
                      <p className="text-lg font-extrabold text-white">₹{order.total.toLocaleString("en-IN")}</p>
                    </div>

                    {/* Status Select */}
                    <select
                      disabled={updatingId === order.id}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none transition-colors cursor-pointer ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : order.status === "SHIPPED"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : order.status === "CONFIRMED"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                          : order.status === "CANCELLED"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      <option value="PENDING" className="bg-slate-900 text-white">Status: PENDING</option>
                      <option value="CONFIRMED" className="bg-slate-900 text-white">Status: CONFIRMED</option>
                      <option value="SHIPPED" className="bg-slate-900 text-white">Status: SHIPPED</option>
                      <option value="DELIVERED" className="bg-slate-900 text-white">Status: DELIVERED</option>
                      <option value="CANCELLED" className="bg-slate-900 text-white">Status: CANCELLED</option>
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
                      <span className="font-medium text-indigo-300">₹{item.price}</span>
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
