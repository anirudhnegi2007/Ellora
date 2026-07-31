"use client";

import { useEffect, useState } from "react";
import { Plus, Package, RefreshCw, CheckCircle2, Search, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  inventory: number;
  image: string;
  category?: { name: string };
  createdAt: string;
}

export default function MerchantProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    price: "",
    inventory: "50",
    image: "",
    categoryId: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/merchant/products"),
        fetch("/api/products"),
      ]);
      const prodData = await prodRes.json();
      if (prodData.products) setProducts(prodData.products);

      // Fetch categories list
      const categoriesData = [
        { id: "660000000000000000000001", name: "Fashion & Apparel" },
        { id: "660000000000000000000002", name: "Electronics & Tech" },
        { id: "660000000000000000000003", name: "Home & Living" },
      ];
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to load merchant products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.image || !form.categoryId) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/merchant/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Product published successfully!");
        setShowModal(false);
        setForm({
          name: "",
          price: "",
          inventory: "50",
          image: "",
          categoryId: "",
          description: "",
        });
        fetchData();
        setTimeout(() => setMessage(null), 3000);
      } else {
        alert(data.error || "Failed to create product");
      }
    } catch (err) {
      console.error("Error creating product:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Product Inventory</h1>
          <p className="text-slate-400 text-sm mt-1">
            Publish products, manage stock counts, and adjust pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {message && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> {message}
            </div>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/30"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" /> Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No products listed yet. Click &quot;Add Product&quot; to publish your first item.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Inventory Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={p.image}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700"
                      />
                      <span className="font-bold text-white">{p.name}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {p.category?.name || "General"}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">₹{p.price.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          p.inventory < 10
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {p.inventory} Units
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white">Publish New Product</h2>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classic Silk Shirt"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1499"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={form.inventory}
                    onChange={(e) => setForm({ ...form, inventory: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Product features and specifications..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/30"
                >
                  {submitting ? "Publishing..." : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
