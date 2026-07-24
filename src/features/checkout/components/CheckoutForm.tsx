"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/validations/order.schema";
import { useCart } from "@/context/CartContext";
import { generateOrderId } from "@/lib/utils";
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";
import { useSession } from "@/lib/auth-client";
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
  const { data: session } = useSession();
  
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  // Address-related states
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveToProfile, setSaveToProfile] = useState(true);

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

  // Fetch saved addresses if logged in
  useEffect(() => {
    if (session?.user) {
      form.setValue("email", session.user.email);
      form.setValue("name", session.user.name || "");
      
      fetch("/api/addresses")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAddresses(data);
            // Default to using the first saved address if available
            if (data.length > 0) {
              const firstAddr = data[0];
              setSelectedAddressId(firstAddr.id);
              form.setValue("name", firstAddr.name);
              form.setValue("address", firstAddr.address);
              form.setValue("city", firstAddr.city);
              form.setValue("zip", firstAddr.zip);
            }
          }
        })
        .catch((err) => console.error("Failed to fetch saved addresses:", err));
    }
  }, [session, form]);

  const handleSelectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    form.setValue("name", addr.name);
    form.setValue("address", addr.address);
    form.setValue("city", addr.city);
    form.setValue("zip", addr.zip);
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    form.setValue("name", session?.user?.name || "");
    form.setValue("address", "");
    form.setValue("city", "");
    form.setValue("zip", "");
  };

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering address selection
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((addr) => addr.id !== id));
        if (selectedAddressId === id) {
          handleUseNewAddress();
        }
      }
    } catch (err) {
      console.error("Failed to delete address:", err);
    }
  };

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

    // If new address is used, user is logged in, and "saveToProfile" is checked, save the address
    if (session?.user && !selectedAddressId && saveToProfile) {
      try {
        const res = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            address: data.address,
            city: data.city,
            zip: data.zip,
          }),
        });
        if (res.ok) {
          const savedAddr = await res.json();
          setAddresses((prev) => [savedAddr, ...prev]);
          setSelectedAddressId(savedAddr.id);
        }
      } catch (err) {
        console.error("Failed to save address to profile:", err);
      }
    }

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
              
              {/* Saved Addresses Section (Only visible if logged in and has saved addresses) */}
              {session?.user && addresses.length > 0 && (
                <div className="sm:col-span-2 space-y-3 mb-2">
                  <FormLabel className="text-zinc-700 dark:text-zinc-300">Saved Shipping Addresses</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`
                            relative flex flex-col justify-between p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 group
                            ${isSelected 
                              ? "border-indigo-650 bg-indigo-50/10 ring-2 ring-indigo-500/10 dark:border-indigo-500 dark:bg-indigo-950/20" 
                              : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"}
                          `}
                        >
                          <div>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                              {addr.name}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                              {addr.address}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {addr.city}, {addr.zip}
                            </p>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full ${isSelected ? 'bg-indigo-100 text-indigo-705 dark:bg-indigo-950 dark:text-indigo-300' : 'text-zinc-400'}`}>
                              {isSelected ? 'Selected' : 'Use this'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteAddress(addr.id, e)}
                              className="text-[10px] text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors uppercase font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div
                      onClick={handleUseNewAddress}
                      className={`
                        flex flex-col items-center justify-center p-4 rounded-xl border border-dashed cursor-pointer transition-all duration-200 min-h-[110px]
                        ${!selectedAddressId 
                          ? "border-indigo-650 bg-indigo-50/10 text-indigo-600 dark:border-indigo-500 dark:bg-indigo-950/10 dark:text-indigo-400" 
                          : "border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"}
                      `}
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        + Use New Address
                      </span>
                    </div>
                  </div>
                </div>
              )}

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

              {/* Checkbox to save new address to profile */}
              {session?.user && !selectedAddressId && (
                <div className="sm:col-span-2 flex items-center gap-2 mt-2">
                  <input
                    id="save-address-checkbox"
                    type="checkbox"
                    checked={saveToProfile}
                    onChange={(e) => setSaveToProfile(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-350 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <label htmlFor="save-address-checkbox" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                    Save this address to my profile
                  </label>
                </div>
              )}
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
