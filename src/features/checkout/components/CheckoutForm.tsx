"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { ShieldCheck, CreditCard, Banknote, Truck } from "lucide-react";

interface CheckoutFormProps {
  onSuccess: (orderId: string, email: string) => void;
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const { cart, totalPrice, clearCart } = useCart();
  const { processPayment, isProcessing, error: paymentError } = useRazorpayPayment();
  const { data: session } = useSession();

  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");
  const [isCodSubmitting, setIsCodSubmitting] = useState(false);
  const [codError, setCodError] = useState<string | null>(null);

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
      paymentMethod: "ONLINE",
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
    },
  });

  // Sync items when cart hydrates or updates
  useEffect(() => {
    form.setValue(
      "items",
      cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }))
    );
  }, [cart, form]);

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



  async function onSubmit(data: CheckoutInput) {
    const checkoutPayload: CheckoutInput = {
      ...data,
      paymentMethod,
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

    if (paymentMethod === "COD") {
      setIsCodSubmitting(true);
      setCodError(null);
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkoutPayload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to place COD order");
        }

        const createdOrder = await res.json();
        clearCart();
        toast.success("Order Placed Successfully!", {
          description: "You will pay in cash upon delivery.",
        });
        onSuccess(createdOrder.id || generateOrderId(), data.email);
      } catch (err: any) {
        const msg = err instanceof Error ? err.message : "Failed to place Cash on Delivery order";
        setCodError(msg);
        toast.error("Order Failed", { description: msg });
      } finally {
        setIsCodSubmitting(false);
      }
      return;
    }

    // Online Payment via Razorpay
    await processPayment({
      checkoutData: checkoutPayload,
      onSuccess: (confirmedOrder) => {
        clearCart();
        onSuccess(confirmedOrder.id || generateOrderId(), data.email);
      },
    });
  }

  const activeSubmitting = isProcessing || isCodSubmitting;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-12 items-start"
      >
        <div className="lg:col-span-7 space-y-6">
          {(paymentError || codError) && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-900/50 flex flex-col gap-1">
              <span className="font-semibold">Order Error</span>
              <span>{paymentError || codError}</span>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Contact & Shipping Info
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              ? "border-indigo-600 bg-indigo-50/10 ring-2 ring-indigo-500/10 dark:border-indigo-500 dark:bg-indigo-950/20" 
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
                            <span className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full ${isSelected ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'text-zinc-400'}`}>
                              {isSelected ? 'Selected' : 'Use this'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={handleUseNewAddress}
                    className="text-xs text-indigo-600 hover:underline dark:text-indigo-400 font-medium"
                  >
                    + Enter a new shipping address
                  </button>
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
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
                      <Input placeholder="New York" {...field} />
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
                    <FormLabel>Postal / Zip Code</FormLabel>
                    <FormControl>
                      <Input placeholder="10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {session?.user && !selectedAddressId && (
                <div className="sm:col-span-2 flex items-center gap-2 mt-2">
                  <input
                    id="save-address-checkbox"
                    type="checkbox"
                    checked={saveToProfile}
                    onChange={(e) => setSaveToProfile(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <label htmlFor="save-address-checkbox" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                    Save this address to my profile
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                onClick={() => setPaymentMethod("ONLINE")}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  paymentMethod === "ONLINE"
                    ? "border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-500/10 dark:border-indigo-500 dark:bg-indigo-950/20"
                    : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">Online Payment (Razorpay)</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Pay via UPI, Cards, NetBanking, or Wallets</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "ONLINE"}
                  onChange={() => setPaymentMethod("ONLINE")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div
                onClick={() => setPaymentMethod("COD")}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  paymentMethod === "COD"
                    ? "border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-500/10 dark:border-indigo-500 dark:bg-indigo-950/20"
                    : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">Cash on Delivery (COD)</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Pay cash upon delivery at your address</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </CardContent>
          </Card>



          {paymentMethod === "ONLINE" ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 dark:border-indigo-950 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200">
              <ShieldCheck className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <div className="text-xs">
                <span className="font-semibold block">Secured by Razorpay</span>
                <span>Supports UPI, Cards, NetBanking, and Wallets. 256-bit SSL Encrypted.</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 dark:border-emerald-950 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">
              <Truck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="text-xs">
                <span className="font-semibold block">Cash on Delivery Info</span>
                <span>Please have the exact amount ready in cash when your order arrives.</span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <OrderSummary
            subtotal={totalPrice}
            actionLabel={paymentMethod === "COD" ? "Place Order (Cash on Delivery)" : "Pay with Razorpay"}
            onAction={form.handleSubmit(onSubmit)}
            isSubmitting={activeSubmitting}
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
