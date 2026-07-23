"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { SearchBar } from "@/features/products/components/SearchBar";
import { useSession, signOut } from "@/lib/auth-client";
import { User, ShoppingBag, Heart, LogOut, ChevronDown } from "lucide-react";

export default function Header() {
  const { totalItems } = useCart();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white transition-all hover:opacity-90">
            E<span className="text-indigo-600 dark:text-indigo-400">llora</span>
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-650 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/#products"
              className="text-sm font-medium text-zinc-650 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
            >
              Products
            </Link>
            
            {/* Categories Dropdown */}
            <div className="relative group">
              <button
                className="text-sm font-medium text-zinc-655 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 focus:outline-none"
                aria-haspopup="true"
              >
                Categories
                <svg
                  className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 rounded-lg border border-zinc-100 bg-white py-1.5 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:ring-zinc-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-205 z-50">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/products?category=${cat.slug}`}
                      className="block px-4 py-2 text-sm text-zinc-750 hover:bg-zinc-50 hover:text-indigo-600 dark:text-zinc-300 dark:hover:bg-zinc-800/50 dark:hover:text-indigo-400 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))
                ) : (
                  <span className="block px-4 py-2 text-xs text-zinc-400 dark:text-zinc-500">
                    Loading...
                  </span>
                )}
              </div>
            </div>
          </nav>
        </div>

        {/* Right side: Search, Cart, Profile, Mobile Menu button */}
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <Suspense fallback={<div className="w-48 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />}>
            <SearchBar />
          </Suspense>

          {/* Cart Icon Link */}
          <Link
            href="/cart"
            className="group relative flex items-center justify-center p-2 text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 transition-colors"
            aria-label="View Cart"
          >
            <svg
              className="h-6 w-6 stroke-current fill-none transition-transform group-hover:scale-105"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-650 text-2xs font-semibold text-white animate-fade-in shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Session Profile Dropdown (Desktop) */}
          {session ? (
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1 focus:outline-none cursor-pointer group"
                aria-label="User menu"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? "User"}
                    className="h-8 w-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 group-hover:border-indigo-500 dark:group-hover:border-indigo-400 group-hover:scale-105 group-hover:ring-2 group-hover:ring-indigo-500/10 transition-all duration-200"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-2xs font-bold text-white uppercase shadow-sm border border-white dark:border-zinc-950 group-hover:scale-105 group-hover:ring-2 group-hover:ring-indigo-500/10 transition-all duration-200">
                    {session.user.name ? session.user.name.charAt(0) : "U"}
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform duration-200 group-hover:opacity-85" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl border border-zinc-200/50 bg-white/95 dark:border-zinc-800/60 dark:bg-zinc-900/95 backdrop-blur-md p-1.5 shadow-lg shadow-zinc-200/50 dark:shadow-none z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Pointing Arrow */}
                  <div className="absolute -top-1.2 right-5.5 h-2.5 w-2.5 rotate-45 border-t border-l border-zinc-200/50 bg-white dark:border-zinc-800/60 dark:bg-zinc-900 z-0" />
                  
                  {/* Profile info heading inside box */}
                  <div className="relative z-10 px-3.5 py-2.5 bg-zinc-50/60 dark:bg-zinc-800/30 rounded-t-lg">
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Signed in as
                    </p>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate mt-0.5">
                      {session.user.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5 font-medium">
                      {session.user.email}
                    </p>
                  </div>
                  
                  <div className="relative z-10 h-px bg-zinc-100 dark:bg-zinc-800 my-1.5" />
                  
                  <nav className="relative z-10 flex flex-col gap-0.5">
                    <Link
                      href="/account"
                      onClick={() => setIsProfileOpen(false)}
                      className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:text-indigo-650 hover:bg-indigo-50/40 dark:text-zinc-300 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/20 transition-all duration-200"
                    >
                      <User className="h-4 w-4 opacity-75 group-hover:scale-105 group-hover:text-indigo-500 transition-all duration-200" />
                      <span>My Account</span>
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:text-violet-650 hover:bg-violet-50/40 dark:text-zinc-300 dark:hover:text-violet-400 dark:hover:bg-violet-950/20 transition-all duration-200"
                    >
                      <ShoppingBag className="h-4 w-4 opacity-75 group-hover:scale-105 group-hover:text-violet-550 transition-all duration-200" />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setIsProfileOpen(false)}
                      className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:text-rose-600 hover:bg-rose-50/40 dark:text-zinc-300 dark:hover:text-rose-400 dark:hover:bg-rose-950/20 transition-all duration-200"
                    >
                      <Heart className="h-4 w-4 opacity-75 group-hover:scale-105 group-hover:text-rose-500 transition-all duration-200" />
                      <span>Wishlist</span>
                    </Link>
                  </nav>

                  <div className="relative z-10 h-px bg-zinc-100 dark:bg-zinc-800 my-1.5" />

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      signOut();
                    }}
                    className="relative z-10 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-650 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
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
              className="hidden md:inline-flex items-center gap-1.5 justify-center rounded-full bg-indigo-650 hover:bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200 dark:bg-indigo-500 dark:hover:bg-indigo-400"
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
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950 md:hidden animate-in fade-in slide-in-from-top-3 duration-200">
          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-zinc-955 dark:text-zinc-50"
            >
              Home
            </Link>
            <Link
              href="/#products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-zinc-955 dark:text-zinc-50"
            >
              Products
            </Link>

            {/* Mobile Categories list */}
            {categories.length > 0 && (
              <div className="flex flex-col gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Categories
                </span>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/products?category=${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium text-zinc-600 hover:text-indigo-650 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile Auth Sections */}
            {session ? (
              <div className="flex flex-col gap-3.5 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2">
                {/* User info */}
                <div className="flex items-center gap-3 px-1">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      className="h-10 w-10 rounded-full object-cover border border-zinc-205 dark:border-zinc-800"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-sm font-bold text-white uppercase shadow-sm">
                      {session.user.name ? session.user.name.charAt(0) : "U"}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-zinc-450 dark:text-zinc-550 truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                {/* Quick actions list */}
                <div className="flex flex-col gap-2.5 pl-1.5 mt-1">
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-sm font-medium text-zinc-650 hover:text-indigo-650 dark:text-zinc-355 dark:hover:text-indigo-400 transition-colors"
                  >
                    <User className="h-4.5 w-4.5 opacity-70" />
                    My Account
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-sm font-medium text-zinc-650 hover:text-violet-650 dark:text-zinc-355 dark:hover:text-violet-400 transition-colors"
                  >
                    <ShoppingBag className="h-4.5 w-4.5 opacity-70" />
                    My Orders
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-sm font-medium text-zinc-655 hover:text-rose-600 dark:text-zinc-355 dark:hover:text-rose-450 transition-colors"
                  >
                    <Heart className="h-4.5 w-4.5 opacity-70" />
                    Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-3 text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 transition-colors cursor-pointer mt-1"
                  >
                    <LogOut className="h-4.5 w-4.5 opacity-80" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-zinc-150 dark:border-zinc-800/80 pt-4 mt-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 py-2.5 text-sm font-semibold hover:bg-zinc-850 active:scale-[0.98] transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (mobileSearchQuery.trim()) {
                  router.push(`/products?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
                  setMobileSearchQuery("");
                  setIsMobileMenuOpen(false);
                }
              }}
              className="relative mt-3"
            >
              <input
                type="text"
                placeholder="Search products..."
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 pr-10 text-sm text-zinc-900 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:bg-white dark:focus:border-indigo-400 dark:focus:bg-zinc-950 transition-all duration-200"
              />
              <button
                type="submit"
                className="absolute right-3.5 top-2.5 text-zinc-400 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors"
                aria-label="Search"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}
