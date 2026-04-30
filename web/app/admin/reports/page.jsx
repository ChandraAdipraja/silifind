"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageOff, X } from "lucide-react";
import api from "../../../lib/api";
import ReportsTable from "../../../components/admin/ReportsTable";
import StatusBadge from "../../../components/admin/StatusBadge";

const toList = (payload) =>
  Array.isArray(payload)
    ? payload
    : payload?.data && Array.isArray(payload.data)
      ? payload.data
      : payload?.reports || [];

const reporterOf = (report) => report?.reportedBy || report?.user || report?.reporter || {};

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await api.get("/reports");
        setReports(toList(response.data));
      } catch (err) {
        setError(err.response?.data?.message || "Gagal memuat laporan.");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    const keyword = search.toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !keyword ||
        [report.title, report.location, report.category].some((field) =>
          String(field || "").toLowerCase().includes(keyword)
        );
      const matchesType = type === "all" || String(report.type).toLowerCase() === type;
      const matchesStatus =
        status === "all" || String(report.status).toLowerCase() === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reports, search, type, status]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_180px_200px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, location, or category"
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
          >
            <option value="all">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="claimed">Claimed</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-sm font-semibold text-slate-500">Loading reports...</div>
      ) : (
        <ReportsTable reports={filteredReports} onView={setSelected} />
      )}

      {selected ? (
        <ReportDetailModal report={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

function ReportDetailModal({ report, onClose }) {
  const reporter = reporterOf(report);
  const image = report.imageUrl || report.image;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Report Detail</h2>
            <p className="text-sm text-slate-500">Informasi lengkap laporan barang.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[260px_1fr]">
          {image ? (
            <img src={image} alt={report.title} className="h-72 w-full rounded-2xl object-cover ring-1 ring-slate-200" />
          ) : (
            <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ImageOff size={32} />
            </div>
          )}

          <div className="space-y-5">
            <div>
              <h3 className="text-2xl font-semibold text-slate-950">{report.title || "-"}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge value={report.type} />
                <StatusBadge value={report.status} />
              </div>
            </div>

            <Info label="Category" value={report.category} />
            <Info label="Description" value={report.description} />
            <Info label="Location" value={report.location} />
            <Info label="Reported By" value={`${reporter.name || "-"} (${reporter.email || "-"})`} />
            <Info
              label="Created At"
              value={report.createdAt ? new Date(report.createdAt).toLocaleString("id-ID") : "-"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{value || "-"}</p>
    </div>
  );
}
