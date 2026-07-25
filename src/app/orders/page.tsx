"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Calendar, Package, MapPin, CreditCard, Banknote, Loader2, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Please sign in to view your orders.");
          }
          throw new Error("Failed to load orders.");
        }
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-12 w-12 text-zinc-400" />}
        title="Unable to load orders"
        description={error}
        actionLabel="Go to Login"
        actionHref="/login"
      />
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-12 w-12 text-zinc-400" />}
        title="No orders found"
        description="You haven't placed any orders yet. Discover our curated collection and place your first order today!"
        actionLabel="Start Shopping"
        actionHref="/products"
      />
    );
  }

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">Confirmed</Badge>;
      case "SHIPPED":
        return <Badge className="bg-blue-600 hover:bg-blue-600 text-white">Shipped</Badge>;
      case "DELIVERED":
        return <Badge className="bg-green-600 hover:bg-green-600 text-white">Delivered</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-600 hover:bg-red-600 text-white">Cancelled</Badge>;
      default:
        return <Badge className="bg-amber-500 hover:bg-amber-500 text-white">Pending</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          My Orders
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Track and view details of all your previous orders.
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="bg-zinc-50 dark:bg-zinc-900/60 py-4 px-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </span>
                  {getStatusBadge(order.status)}
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                    {order.paymentMethod === "COD" ? (
                      <>
                        <Banknote className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        COD ({order.paymentStatus})
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        Online ({order.paymentStatus})
                      </>
                    )}
                  </span>
                  <span className="text-base font-bold text-zinc-900 dark:text-white">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Order Items */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {item.productName}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Qty: {item.quantity} &times; {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping Information Footer */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  <span className="truncate">
                    Delivering to <strong className="text-zinc-700 dark:text-zinc-300">{order.shippingName}</strong>, {order.shippingAddress}, {order.shippingCity} {order.shippingZip}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
