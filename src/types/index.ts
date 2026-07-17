export type { Product, ProductListItem, ProductSearchParams, PaginatedResponse } from "./product";
export type { CartItem, CartState } from "./cart";
export type { Order, OrderItem, OrderStatus } from "./order";
export type { Review, ReviewSummary } from "./review";

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

export interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    category: { name: string; slug: string };
    rating: { rate: number; count: number };
  };
  createdAt: string;
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  discountAmount: number;
}
