export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  userName: string;
  productId: string;
  createdAt: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
}
