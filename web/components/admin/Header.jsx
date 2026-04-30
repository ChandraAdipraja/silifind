"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, Menu, Search, X } from "lucide-react";
import StatusBadge from "./StatusBadge";

const titles = {
  "/admin/dashboard": "Dashboard",
  "/admin/reports": "Reports Management",
  "/admin/claims": "Claims Verification",
  "/admin/users": "Users Management",
  "/admin/profile": "Profile",
};

export default function Header({ user, pathname }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTimeout = useRef(null);
  const title = titles[pathname] || "SiliFind Dashboard";
  const initial = (user?.name || user?.email || "S").charAt(0).toUpperCase();
  const currentSearch = searchParams?.get("q") || "";

  const submitSearch = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") || "").trim();
    const params = new URLSearchParams(searchParams?.toString() || "");

    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    const queryString = params.toString();
    router.push(`/admin/dashboard${queryString ? `?${queryString}` : ""}`);
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("q");
    const queryString = params.toString();
    router.push(`/admin/dashboard${queryString ? `?${queryString}` : ""}`);
  };

  const queueSearch = (event) => {
    const form = event.currentTarget.form;
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => form?.requestSubmit(), 350);
  };

  useEffect(
    () => () => {
      clearTimeout(searchTimeout.current);
    },
    []
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="text-sm font-medium text-slate-500">Web Admin</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form
            onSubmit={submitSearch}
            className="relative block min-w-0 sm:w-80"
            role="search"
          >
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              name="q"
              key={currentSearch}
              defaultValue={currentSearch}
              onChange={queueSearch}
              placeholder="Search reports, claims..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            />
            {currentSearch ? (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            ) : null}
          </form>

          <button
            type="button"
            className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 sm:flex"
            aria-label="Notifications"
          >
            <Bell size={19} />
          </button>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">
                {user?.name || "SiliFind Staff"}
              </p>
              <div className="mt-1">
                <StatusBadge value={user?.role || "operator"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
