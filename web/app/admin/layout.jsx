"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import api from "../../lib/api";
import AccessDenied from "../../components/admin/AccessDenied";
import Header from "../../components/admin/Header";
import Sidebar from "../../components/admin/Sidebar";

const pageTitles = {
  "/admin/dashboard": "Dashboard",
  "/admin/reports": "Reports Management",
  "/admin/claims": "Claims Verification",
  "/admin/users": "Users Management",
  "/admin/profile": "Profile",
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [deniedMessage, setDeniedMessage] = useState("");
  const showHeader = pathname === "/admin/dashboard";

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await api.get("/auth/profile");
        const profile =
          response.data?.user || response.data?.data || response.data;

        if (!["admin", "operator"].includes(profile?.role)) {
          localStorage.removeItem("token");
          setDenied(true);
          return;
        }

        if (pathname === "/admin/users" && profile.role !== "admin") {
          setDeniedMessage(
            "Akses ditolak. Users Management hanya dapat diakses oleh admin.",
          );
          setDenied(true);
          return;
        }

        setUser(profile);
      } catch {
        localStorage.removeItem("token");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [pathname, router]);

  if (denied) return <AccessDenied message={deniedMessage || undefined} />;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar user={user} />
      <div className="lg:pl-72">
        {showHeader ? (
          <Suspense fallback={null}>
            <Header user={user} pathname={pathname} />
          </Suspense>
        ) : (
          <TextHeader pathname={pathname} />
        )}
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

function TextHeader({ pathname }) {
  const title = pageTitles[pathname] || "SiliFind Dashboard";

  return (
    <header className="border-b border-slate-200 bg-slate-50 px-4 py-5 md:px-8">
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h1>
    </header>
  );
}
