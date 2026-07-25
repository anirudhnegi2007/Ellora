"use client";

import React, { useState, useEffect } from "react";
import { Rating } from "@/components/shared/Rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import type { Review } from "@/types";
import { Star, MessageSquare, CheckCircle2, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: string;
  initialRating: { rate: number; count: number };
}

export function ProductReviews({ productId, initialRating }: ProductReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchReviews() {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch {
      // Ignore fetch error silently
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const totalReviews = reviews.length > 0 ? reviews.length : initialRating.count;
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10
      : initialRating.rate;

  // Star breakdown calculation
  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { star, count, percentage };
  });

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Please sign in to write a review.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: userRating,
          comment: comment.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit review");
      }

      toast.success("Thank you! Your rating and review have been submitted.");
      setComment("");
      fetchReviews();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-16 border-t border-zinc-200 dark:border-zinc-800 pt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Customer Ratings & Reviews
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real feedback from verified purchasers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Rating Overview Card */}
        <div className="lg:col-span-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="text-center pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="text-5xl font-extrabold text-zinc-900 dark:text-white">
              {avgRating > 0 ? avgRating.toFixed(1) : "0.0"}
            </div>
            <div className="flex justify-center mt-2">
              <Rating rating={avgRating} count={totalReviews} size="lg" showCount={false} />
            </div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-2">
              Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>

          {/* Star Breakdown */}
          <div className="mt-6 space-y-2.5">
            {starCounts.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                  {star} <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium text-zinc-400">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List & Submission Form */}
        <div className="lg:col-span-8 space-y-8">
          {/* Write a Review Box */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 dark:border-indigo-950 dark:bg-indigo-950/10">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Rate & Review this product
            </h3>
            {session?.user ? (
              <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Your Rating
                  </label>
                  <Rating
                    rating={userRating}
                    interactive
                    onRatingChange={setUserRating}
                    size="lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Review Comment (optional)
                  </label>
                  <Textarea
                    placeholder="Share your thoughts about this product's quality, fit, or performance..."
                    value={comment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                    rows={3}
                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs"
                  />
                </div>
                <Button type="submit" disabled={submitting} size="sm" className="gap-2">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Submit Review
                </Button>
              </form>
            ) : (
              <div className="mt-3 flex items-center justify-between text-xs">
                <p className="text-zinc-600 dark:text-zinc-400">
                  Please sign in to share your experience and rate this product.
                </p>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Customer Reviews ({reviews.length})
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8 text-zinc-400 text-xs gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  No reviews yet.
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  Be the first customer to rate this product!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {reviews.map((r) => (
                  <div key={r.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {r.userName ? r.userName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1">
                            {r.userName || "Verified Buyer"}
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            {new Date(r.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <Rating rating={r.rating} size="sm" showCount={false} />
                    </div>
                    {r.comment && (
                      <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 pl-10">
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
