"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheckoutSuccessProps {
  orderId: string;
  email: string;
}

export function CheckoutSuccess({ orderId, email }: CheckoutSuccessProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
      <div className="rounded-full bg-emerald-100 p-6 dark:bg-emerald-950">
        <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Order Confirmed!
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
        Thank you for your purchase. We&apos;ve sent a confirmation email to{" "}
        <span className="font-semibold text-zinc-900 dark:text-white">{email}</span>.
        Your order ID is <span className="font-mono font-semibold">#{orderId.slice(-8).toUpperCase()}</span>.
      </p>
      <Button asChild className="mt-8" size="lg">
        <Link href="/">Back to Homepage</Link>
      </Button>
    </div>
  );
}
