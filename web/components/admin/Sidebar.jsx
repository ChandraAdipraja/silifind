"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileSearch,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserCircle,
  Users,
} from "lucide-react";

const menu = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Reports Management", href: "/admin/reports", icon: FileSearch },
  { label: "Claims Verification", href: "/admin/claims", icon: ShieldCheck },
  { label: "Users Management", href: "/admin/users", icon: Users, adminOnly: true },
  { label: "Profile", href: "/admin/profile", icon: UserCircle },
];

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <aside className="hidden min-h-screen w-72 border-r border-slate-200 bg-white px-5 py-6 shadow-sm lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col">
      <Link href="/admin/dashboard" className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 text-lg font-bold text-white shadow-sm">
          S
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-950">SiliFind</p>
          <p className="text-xs font-medium text-slate-500">Admin Console</p>
        </div>
      </Link>

      <nav className="mt-9 flex flex-1 flex-col gap-1">
        {menu
          .filter((item) => !item.adminOnly || user?.role === "admin")
          .map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-950">
          {user?.name || "Operator"}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500">{user?.email}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-rose-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-rose-50"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
