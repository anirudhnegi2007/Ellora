import { LoginForm } from "@/features/auth/components/LoginForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In - Ellora",
  description: "Sign in to your Ellora account",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900/30">
      <Suspense fallback={
        <div className="w-full max-w-md p-6 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm animate-pulse">
          <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
