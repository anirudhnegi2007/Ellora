export interface ProductRating {
  rate: number;
  count: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number | null;
  inventory: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  details: string[];
  inventory: number;
  category: ProductCategory;
  rating: ProductRating;
  variants?: ProductVariant[];
  createdAt?: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: ProductCategory;
  rating: ProductRating;
  inventory: number;
}

export interface ProductSearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: "price-asc" | "price-desc" | "rating" | "newest" | "name";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
