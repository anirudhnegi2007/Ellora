"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const { data: session } = useSession();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!session?.user) return null;

  async function toggleWishlist() {
    setIsLoading(true);
    try {
      if (isInWishlist) {
        await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
        setIsInWishlist(false);
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        setIsInWishlist(true);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleWishlist}
      disabled={isLoading}
      className={cn(className)}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn("h-5 w-5", isInWishlist && "fill-red-500 text-red-500")}
      />
    </Button>
  );
}
