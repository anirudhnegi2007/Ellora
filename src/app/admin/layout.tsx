import { requireRole } from "@/lib/rbac";
import Link from "next/link";

export const dynamic = "force-dynamic";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  FolderTree,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["ADMIN"]);

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Global Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Merchant Portal", href: "/merchant", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800 backdrop-blur-xl flex flex-col justify-between p-4 sticky top-0 h-screen z-20">
        <div>
          {/* Logo & Role Badge */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
                E
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Ellora Admin
              </span>
            </Link>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Admin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all font-medium text-sm group"
              >
                <item.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* User Profile Info & Back to Store */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-400 bg-slate-800/40 hover:bg-slate-800 hover:text-white transition-all border border-slate-700/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
