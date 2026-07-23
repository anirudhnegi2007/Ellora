import { LoginForm } from "@/features/auth/components/LoginForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In - Ellora",
  description: "Sign in to your Ellora account",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300/30 dark:bg-indigo-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-purple-300/30 dark:bg-purple-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/20 dark:bg-pink-900/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={
          <div className="w-full p-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl shadow-zinc-200/40 dark:shadow-none animate-pulse">
            <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-6" />
            <div className="space-y-4">
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
