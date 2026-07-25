export type { Product, ProductListItem, ProductSearchParams, PaginatedResponse } from "./product";
export type { CartItem, CartState } from "./cart";
export type { Order, OrderItem, OrderStatus, PaymentStatus } from "./order";
export type { Review, ReviewSummary } from "./review";
export type { RazorpayOptions, RazorpayPaymentSuccessResponse, RazorpayInstance } from "./razorpay";

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  productCount?: number;
}


export interface CouponValidation {
  valid: boolean;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  discountAmount: number;
}
