"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { CheckoutForm } from "./CheckoutForm";
import { CheckoutSuccess } from "./CheckoutSuccess";
import { EmptyState } from "@/components/shared/EmptyState";
import { ShoppingBag } from "lucide-react";

export function CheckoutPageClient() {
  const { cart } = useCart();
  const [orderResult, setOrderResult] = useState<{ id: string; email: string } | null>(null);

  if (orderResult) {
    return <CheckoutSuccess orderId={orderResult.id} email={orderResult.email} />;
  }

  if (cart.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-12 w-12 text-zinc-400" />}
        title="Checkout is empty"
        description="Please add items to your cart before checking out."
        actionLabel="Shop Products"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Checkout
      </h1>
      <div className="mt-8">
        <CheckoutForm
          onSuccess={(orderId, email) => setOrderResult({ id: orderId, email })}
        />
      </div>
    </div>
  );
}
