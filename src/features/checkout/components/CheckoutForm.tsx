"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/validations/order.schema";
import { useCart } from "@/context/CartContext";
import { generateOrderId } from "@/lib/utils";
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";
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
import { ShieldCheck } from "lucide-react";

interface CheckoutFormProps {
  onSuccess: (orderId: string, email: string) => void;
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const { cart, totalPrice, clearCart } = useCart();
  const { processPayment, isProcessing, error: paymentError } = useRazorpayPayment();
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
    const checkoutPayload: CheckoutInput = {
      ...data,
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
    };

    await processPayment({
      checkoutData: checkoutPayload,
      onSuccess: (confirmedOrder) => {
        clearCart();
        onSuccess(confirmedOrder.id || generateOrderId(), data.email);
      },
    });
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-12 items-start"
      >
        <div className="lg:col-span-7 space-y-6">
          {paymentError && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-900/50 flex flex-col gap-1">
              <span className="font-semibold">Payment Status</span>
              <span>{paymentError}</span>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Contact & Shipping Info
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
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
                      <Input placeholder="John Doe" {...field} />
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
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, Apt 4B" {...field} />
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
                      <Input placeholder="Mumbai" {...field} />
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
                      <Input placeholder="400001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coupon Code</CardTitle>
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
                <p className="text-xs text-emerald-600 mt-2 font-medium">Coupon applied successfully!</p>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center gap-3 p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 dark:border-indigo-950 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200">
            <ShieldCheck className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <div className="text-xs">
              <span className="font-semibold block">Secured by Razorpay</span>
              <span>Supports UPI, Cards, NetBanking, and Wallets. 256-bit SSL Encrypted.</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <OrderSummary
            subtotal={totalPrice}
            discount={discount}
            actionLabel="Pay with Razorpay"
            onAction={form.handleSubmit(onSubmit)}
            isSubmitting={isProcessing}
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
