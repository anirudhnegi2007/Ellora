import { useState, useEffect, useCallback } from "react";

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Razorpay) {
      setIsLoaded(true);
    }
  }, []);

  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      if (window.Razorpay) {
        setIsLoaded(true);
        resolve(true);
        return;
      }

      const existingScript = document.getElementById("razorpay-checkout-js");
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          setIsLoaded(true);
          resolve(true);
        });
        existingScript.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-checkout-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        setIsLoaded(true);
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }, []);

  return { isLoaded, loadRazorpayScript };
}
