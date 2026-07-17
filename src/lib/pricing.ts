import { TAX_RATE, SHIPPING_COST } from "@/lib/constants";

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export function calculateOrderTotals(
  subtotal: number,
  discount = 0
): OrderTotals {
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping = subtotal > 0 ? SHIPPING_COST : 0;
  const tax = discountedSubtotal * TAX_RATE;

  return {
    subtotal,
    shipping,
    tax,
    discount,
    total: discountedSubtotal + shipping + tax,
  };
}
