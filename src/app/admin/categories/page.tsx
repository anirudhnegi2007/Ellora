import { db } from "@/lib/db";
import { FolderTree, Plus, Package, Layers } from "lucide-react";
import Image from "next/image";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FolderTree className="w-8 h-8 text-indigo-400" />
            Category Management
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Organize product catalog categories, view listing counts, and manage catalog structure.
          </p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            Total Categories
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-3">{categories.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            Categorized Products
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-3">
            {categories.reduce((acc, c) => acc + c._count.products, 0)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            Average Products per Category
            <FolderTree className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-3">
            {categories.length > 0
              ? Math.round(categories.reduce((acc, c) => acc + c._count.products, 0) / categories.length)
              : 0}
          </p>
        </div>
      </div>

      {/* Categories Table / Grid */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <h2 className="text-lg font-bold text-white mb-4">Catalog Categories</h2>

        {categories.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
            <p>No categories found in catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4 hover:border-slate-700 transition-all shadow-md group"
              >
                <div className="w-14 h-14 rounded-lg bg-slate-800 overflow-hidden relative flex-shrink-0 border border-slate-700/60">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">
                      No Img
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{category.name}</h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">/{category.slug}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Package className="w-3 h-3" /> {category._count.products} products
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
