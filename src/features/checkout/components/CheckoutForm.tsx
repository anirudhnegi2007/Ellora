"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/validations/order.schema";
import { useCart } from "@/context/CartContext";
import { generateOrderId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderSummary } from "@/components/shared/OrderSummary";

interface CheckoutFormProps {
  onSuccess: (orderId: string, email: string) => void;
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const { cart, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      name: "",
      address: "",
      city: "",
      zip: "",
      couponCode: "",
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
    },
  });

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal: totalPrice }),
      });

      if (!res.ok) {
        const data = await res.json();
        setCouponError(data.message ?? "Invalid coupon");
        return;
      }

      const data = await res.json();
      setDiscount(data.discountAmount);
      form.setValue("couponCode", couponCode);
    } catch {
      setCouponError("Failed to validate coupon");
    }
  }

  async function onSubmit(data: CheckoutInput) {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message ?? "Failed to place order");
        setIsSubmitting(false);
        return;
      }

      const order = await res.json();
      clearCart();
      onSuccess(order.id ?? generateOrderId(), data.email);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-12 items-start"
      >
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/50 p-3 rounded-lg">
              {error}
            </p>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Contact & Shipping Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coupon Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                <Button type="button" variant="outline" onClick={applyCoupon}>
                  Apply
                </Button>
              </div>
              {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
              {discount > 0 && (
                <p className="text-xs text-emerald-600 mt-2">Coupon applied successfully!</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <OrderSummary
            subtotal={totalPrice}
            discount={discount}
            actionLabel="Place Order"
            onAction={form.handleSubmit(onSubmit)}
            isSubmitting={isSubmitting}
            showItems
            items={cart.map((item) => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
              image: item.product.image,
            }))}
          />
        </div>
      </form>
    </FormProvider>
  );
}
