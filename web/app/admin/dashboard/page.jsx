"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClipboardList, PackageCheck, PackageSearch, RotateCcw, ShieldQuestion } from "lucide-react";
import api from "../../../lib/api";
import ClaimsTable from "../../../components/admin/ClaimsTable";
import ReportsTable from "../../../components/admin/ReportsTable";
import StatCard from "../../../components/admin/StatCard";

const toList = (payload) =>
  Array.isArray(payload)
    ? payload
    : payload?.data && Array.isArray(payload.data)
      ? payload.data
      : payload?.reports || payload?.claims || [];

const searchableValue = (value) => {
  if (value === null || value === undefined) return "";

  if (["string", "number", "boolean"].includes(typeof value)) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(searchableValue).join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value).map(searchableValue).join(" ");
  }

  return "";
};

const matchesSearch = (item, keyword) =>
  !keyword || searchableValue(item).toLowerCase().includes(keyword);

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm font-semibold text-slate-500">
          Loading dashboard data...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [reports, setReports] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const search = (searchParams?.get("q") || "").trim();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [reportsResponse, claimsResponse] = await Promise.all([
          api.get("/reports"),
          api.get("/claims"),
        ]);
        setReports(toList(reportsResponse.data));
        setClaims(toList(claimsResponse.data));
      } catch (err) {
        setError(err.response?.data?.message || "Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const count = (items, key, value) =>
      items.filter((item) => String(item[key]).toLowerCase() === value).length;

    return {
      totalReports: reports.length,
      lostReports: count(reports, "type", "lost"),
      foundReports: count(reports, "type", "found"),
      pendingClaims: count(claims, "status", "pending"),
      returnedItems: count(reports, "status", "returned"),
    };
  }, [reports, claims]);

  const searchResults = useMemo(() => {
    const keyword = search.toLowerCase();

    return {
      reports: reports.filter((report) => matchesSearch(report, keyword)),
      claims: claims.filter((claim) => matchesSearch(claim, keyword)),
    };
  }, [reports, claims, search]);

  const visibleReports = search ? searchResults.reports : reports.slice(0, 6);
  const visibleClaims = search ? searchResults.claims : claims.slice(0, 6);
  const resultCount = searchResults.reports.length + searchResults.claims.length;

  if (loading) {
    return <div className="text-sm font-semibold text-slate-500">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Reports" value={stats.totalReports} icon={ClipboardList} tone="blue" />
        <StatCard title="Lost Reports" value={stats.lostReports} icon={PackageSearch} tone="amber" />
        <StatCard title="Found Reports" value={stats.foundReports} icon={PackageCheck} tone="emerald" />
        <StatCard title="Pending Claims" value={stats.pendingClaims} icon={ShieldQuestion} tone="violet" />
        <StatCard title="Returned Items" value={stats.returnedItems} icon={RotateCcw} tone="teal" />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              {search ? "Matching Reports" : "Recent Reports"}
            </h2>
            <p className="text-sm text-slate-500">
              {search
                ? `${searchResults.reports.length} report result${
                    searchResults.reports.length === 1 ? "" : "s"
                  } for "${search}".`
                : "Laporan terbaru dari pengguna mobile."}
            </p>
          </div>
        </div>
        <ReportsTable reports={visibleReports} compact />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            {search ? "Matching Claims" : "Recent Claims"}
          </h2>
          <p className="text-sm text-slate-500">
            {search
              ? `${searchResults.claims.length} claim result${
                  searchResults.claims.length === 1 ? "" : "s"
                } for "${search}". ${resultCount ? "" : "No database records matched this search."}`
              : "Klaim terbaru yang masuk untuk diverifikasi."}
          </p>
        </div>
        <ClaimsTable claims={visibleClaims} compact />
      </section>
    </div>
  );
}
