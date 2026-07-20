"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { CheckoutInput } from "@/validations/order.schema";
import type { Order } from "@/types";
import type { RazorpayOptions, RazorpayPaymentSuccessResponse } from "@/types/razorpay";

export type PaymentState =
  | "idle"
  | "loading_script"
  | "creating_order"
  | "awaiting_payment"
  | "verifying_payment"
  | "success"
  | "error"
  | "cancelled";

export interface ProcessPaymentParams {
  checkoutData: CheckoutInput;
  onSuccess?: (order: Order) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export function useRazorpayPayment() {
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [error, setError] = useState<string | null>(null);
  
  // Ref lock to guarantee prevention of concurrent duplicate payment requests
  const isProcessingRef = useRef(false);

  const isProcessing = paymentState !== "idle" && paymentState !== "success" && paymentState !== "error" && paymentState !== "cancelled";

  // Dynamic script loader for Razorpay Checkout SDK
  const loadScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.getElementById("razorpay-checkout-js");
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-checkout-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }, []);

  const resetPaymentState = useCallback(() => {
    isProcessingRef.current = false;
    setPaymentState("idle");
    setError(null);
  }, []);

  const processPayment = useCallback(
    async ({ checkoutData, onSuccess, onError, onCancel }: ProcessPaymentParams) => {
      // 1. Duplicate Request Protection
      if (isProcessingRef.current) {
        toast.warning("Payment process is already in progress. Please wait...");
        return;
      }

      isProcessingRef.current = true;
      setError(null);

      // Check online status before initiating network requests
      if (typeof window !== "undefined" && !navigator.onLine) {
        const errorMsg = "You are currently offline. Please check your internet connection and try again.";
        setError(errorMsg);
        setPaymentState("error");
        isProcessingRef.current = false;
        toast.error("Network Error", { description: errorMsg });
        onError?.(errorMsg);
        return;
      }

      const toastId = toast.loading("Initializing payment gateway...");

      try {
        // 2. Load SDK dynamically
        setPaymentState("loading_script");
        const scriptLoaded = await loadScript();
        if (!scriptLoaded) {
          throw new Error("Unable to load Razorpay SDK. Please verify your internet connection.");
        }

        // 3. Create Razorpay order via backend API
        setPaymentState("creating_order");
        toast.loading("Preparing order details...", { id: toastId });

        const createRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkoutData),
        });

        if (!createRes.ok) {
          const errData = await createRes.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to create payment order. Please try again.");
        }

        const { razorpayOrderId, amount, currency, key } = await createRes.json();

        if (!razorpayOrderId || !key) {
          throw new Error("Invalid response received from payment server.");
        }

        // 4. Open Razorpay Checkout Popup
        setPaymentState("awaiting_payment");
        toast.dismiss(toastId);

        const options: RazorpayOptions = {
          key: key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          amount: amount,
          currency: currency || "INR",
          name: "Ellora Store",
          description: `Order Payment (${checkoutData.items.length} ${checkoutData.items.length === 1 ? "item" : "items"})`,
          order_id: razorpayOrderId,
          prefill: {
            name: checkoutData.name,
            email: checkoutData.email,
          },
          theme: {
            color: "#4f46e5",
          },
          modal: {
            ondismiss: () => {
              // Handle User Cancellation
              setPaymentState("cancelled");
              isProcessingRef.current = false;
              toast.info("Payment Cancelled", {
                description: "You closed the payment popup before completing the transaction.",
              });
              onCancel?.();
            },
          },
          handler: async (response: RazorpayPaymentSuccessResponse) => {
            const verifyToastId = toast.loading("Verifying payment security...");
            setPaymentState("verifying_payment");

            try {
              // 5. Call verify-payment API
              const verifyRes = await fetch("/api/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  checkoutData: checkoutData,
                }),
              });

              if (!verifyRes.ok) {
                const errData = await verifyRes.json().catch(() => ({}));
                throw new Error(errData.message || "Payment verification failed. Please contact support.");
              }

              const confirmedOrder: Order = await verifyRes.json();

              // Payment Success
              setPaymentState("success");
              isProcessingRef.current = false;
              toast.success("Payment Successful!", {
                id: verifyToastId,
                description: `Order #${confirmedOrder.id} has been placed successfully.`,
              });

              onSuccess?.(confirmedOrder);
            } catch (err: unknown) {
              const errorMessage = err instanceof Error ? err.message : "Payment verification failed.";
              setError(errorMessage);
              setPaymentState("error");
              isProcessingRef.current = false;
              toast.error("Verification Error", {
                id: verifyToastId,
                description: errorMessage,
              });
              onError?.(errorMessage);
            }
          },
        };

        if (!window.Razorpay) {
          throw new Error("Razorpay SDK instance unavailable.");
        }

        const razorpayInstance = new window.Razorpay(options);

        // Handle Razorpay Payment Failure event (e.g. card declined, invalid OTP)
        razorpayInstance.on("payment.failed", (failureResponse: unknown) => {
          const failureData = failureResponse as { error?: { description?: string; reason?: string } };
          const failureMsg = failureData?.error?.description || failureData?.error?.reason || "Transaction failed. Please try a different payment method.";
          
          setError(failureMsg);
          setPaymentState("error");
          isProcessingRef.current = false;
          toast.error("Payment Failed", { description: failureMsg });
          onError?.(failureMsg);
        });

        razorpayInstance.open();
      } catch (err: unknown) {
        toast.dismiss(toastId);
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during payment.";
        setError(errorMessage);
        setPaymentState("error");
        isProcessingRef.current = false;

        toast.error("Payment Request Failed", {
          description: errorMessage,
        });

        onError?.(errorMessage);
      }
    },
    [loadScript]
  );

  return {
    processPayment,
    isProcessing,
    paymentState,
    error,
    resetPaymentState,
  };
}
