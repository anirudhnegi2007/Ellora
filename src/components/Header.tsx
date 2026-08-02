"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { SearchBar } from "@/features/products/components/SearchBar";
import { useSession, signOut } from "@/lib/auth-client";
import {
  User,
  ShoppingBag,
  LogOut,
  ChevronDown,
  Search,
  Menu,
  X,
  ShoppingCart,
  Shield,
} from "lucide-react";

export default function Header() {
  const { totalItems } = useCart();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setMobileSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white transition-opacity hover:opacity-90"
          >
            E<span className="text-indigo-600 dark:text-indigo-400">llora</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/#products"
              className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
            >
              Products
            </Link>
          </nav>
        </div>

        {/* Search, Cart, Profile, Mobile Menu */}
        <div className="flex items-center gap-4">
          <Suspense fallback={<div className="h-10 w-48 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />}>
            <SearchBar />
          </Suspense>

          {/* Cart Icon Link */}
          <Link
            href="/cart"
            className="group relative flex items-center justify-center p-2 text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 transition-colors"
            aria-label="View Cart"
          >
            <ShoppingCart className="h-6 w-6 transition-transform group-hover:scale-105" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Profile Dropdown (Desktop) */}
          {session ? (
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="group flex items-center gap-1 cursor-pointer focus:outline-none"
                aria-label="User menu"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "User"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full border border-zinc-200 object-cover transition-all duration-200 group-hover:scale-105 group-hover:border-indigo-500 dark:border-zinc-800 dark:group-hover:border-indigo-400"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-xs font-bold text-white uppercase shadow-sm transition-all duration-200 group-hover:scale-105 dark:border-zinc-950">
                    {session.user.name ? session.user.name.charAt(0) : "U"}
                  </span>
                )}
                <ChevronDown
                  className={`h-3.5 w-3.5 opacity-50 transition-transform duration-200 group-hover:opacity-80 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl border border-zinc-200/50 bg-white/95 p-1.5 shadow-lg backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-900/95 dark:shadow-none z-50">
                  <div className="rounded-t-lg bg-zinc-50/60 px-3.5 py-2.5 dark:bg-zinc-800/30">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider dark:text-zinc-500">
                      Signed in as
                    </p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-zinc-900 dark:text-white">
                      {session.user.name}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                      {session.user.email}
                    </p>
                  </div>

                  <div className="my-1.5 h-px bg-zinc-100 dark:bg-zinc-800" />

                  <nav className="flex flex-col gap-0.5">
                    <Link
                      href="/account"
                      onClick={() => setIsProfileOpen(false)}
                      className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-indigo-50/50 hover:text-indigo-600 dark:text-zinc-300 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400 transition-colors"
                    >
                      <User className="h-4 w-4 opacity-75 group-hover:text-indigo-500 transition-colors" />
                      <span>My Account</span>
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-violet-50/50 hover:text-violet-600 dark:text-zinc-300 dark:hover:bg-violet-950/20 dark:hover:text-violet-400 transition-colors"
                    >
                      <ShoppingBag className="h-4 w-4 opacity-75 group-hover:text-violet-500 transition-colors" />
                      <span>My Orders</span>
                    </Link>
                    {(session.user as { role?: string }).role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50/50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-300 transition-colors"
                      >
                        <Shield className="h-4 w-4 opacity-75 group-hover:text-amber-500 transition-colors" />
                        <span>Admin Portal</span>
                      </Link>
                    )}
                  </nav>

                  <div className="my-1.5 h-px bg-zinc-100 dark:bg-zinc-800" />

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      signOut();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 opacity-80" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              <User className="h-3.5 w-3.5" />
              Sign In
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-zinc-900 dark:text-zinc-50"
            >
              Home
            </Link>
            <Link
              href="/#products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-zinc-900 dark:text-zinc-50"
            >
              Products
            </Link>

            {/* Mobile Auth Sections */}
            {session ? (
              <div className="mt-2 flex flex-col gap-3.5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <div className="flex items-center gap-3 px-1">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full border border-zinc-200 object-cover dark:border-zinc-800"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-sm font-bold text-white uppercase shadow-sm">
                      {session.user.name ? session.user.name.charAt(0) : "U"}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                      {session.user.name}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <div className="mt-1 flex flex-col gap-2.5 pl-1.5">
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
                  >
                    <User className="h-4.5 w-4.5 opacity-70" />
                    My Account
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-sm font-medium text-zinc-600 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 transition-colors"
                  >
                    <ShoppingBag className="h-4.5 w-4.5 opacity-70" />
                    My Orders
                  </Link>

                  {(session.user as { role?: string }).role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                    >
                      <Shield className="h-4.5 w-4.5 opacity-80" />
                      Admin Portal
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut();
                    }}
                    className="mt-1 flex items-center gap-3 text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4.5 w-4.5 opacity-80" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 border-t border-zinc-150 pt-4 dark:border-zinc-800">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}

            <form onSubmit={handleMobileSearchSubmit} className="relative mt-3">
              <input
                type="text"
                placeholder="Search products..."
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 pr-10 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-indigo-400 dark:focus:bg-zinc-950 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-3.5 top-2.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}
