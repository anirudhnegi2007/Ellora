"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { calculateOrderTotals } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface OrderSummaryProps {
  subtotal: number;
  discount?: number;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  isSubmitting?: boolean;
  showItems?: boolean;
  items?: { name: string; quantity: number; price: number; image: string }[];
}

export function OrderSummary({
  subtotal,
  discount = 0,
  actionLabel = "Proceed to Checkout",
  actionHref,
  onAction,
  isSubmitting = false,
  showItems = false,
  items = [],
}: OrderSummaryProps) {
  const totals = calculateOrderTotals(subtotal, discount);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Order Summary</h2>

      {showItems && items.length > 0 && (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-60 overflow-y-auto">
          {items.map((item) => (
            <div key={item.name} className="flex py-3 items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="h-12 w-12 rounded object-cover border border-zinc-200 dark:border-zinc-800"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                  {item.name}
                </h4>
                <p className="text-[10px] text-zinc-500">Qty: {item.quantity}</p>
              </div>
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
          <span>Subtotal</span>
          <span className="font-semibold text-zinc-900 dark:text-white">
            {formatPrice(totals.subtotal)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span className="font-semibold">-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
          <span>Shipping</span>
          <span className="font-semibold text-zinc-900 dark:text-white">
            {totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
          </span>
        </div>
        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
          <span>Estimated Tax (8%)</span>
          <span className="font-semibold text-zinc-900 dark:text-white">
            {formatPrice(totals.tax)}
          </span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between text-base font-bold text-zinc-900 dark:text-white">
        <span>Total</span>
        <span>{formatPrice(totals.total)}</span>
      </div>

      {actionHref ? (
        <Button asChild className="w-full" size="lg">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : onAction ? (
        <Button
          className="w-full"
          size="lg"
          onClick={onAction}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
