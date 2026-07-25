import { TAX_RATE, SHIPPING_COST } from "@/lib/constants";

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export function calculateOrderTotals(subtotal: number): OrderTotals {
  const shipping = subtotal > 0 ? SHIPPING_COST : 0;
  const tax = subtotal * TAX_RATE;

  return {
    subtotal,
    shipping,
    tax,
    total: subtotal + shipping + tax,
  };
}
