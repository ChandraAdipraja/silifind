"use client";

import { Eye, ImageOff, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge";

const getReporter = (report) =>
  report?.reportedBy || report?.user || report?.reporter || {};

export default function ReportsTable({
  reports = [],
  compact = false,
  onDelete,
  onView,
}) {
  if (!reports.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        Belum ada laporan untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Image
              </th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Title
              </th>
              {!compact ? (
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </th>
              ) : null}
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type
              </th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location
              </th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reported By
              </th>
              {!compact ? (
                <>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created At
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {reports.map((report) => {
              const reporter = getReporter(report);

              return (
                <tr
                  key={report._id || report.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    {report.imageUrl || report.image ? (
                      <img
                        src={report.imageUrl || report.image}
                        alt={report.title}
                        className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <ImageOff size={18} />
                      </div>
                    )}
                  </td>
                  <td className="max-w-56 px-5 py-4">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {report.title || "-"}
                    </p>
                  </td>
                  {!compact ? (
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {report.category || "-"}
                    </td>
                  ) : null}
                  <td className="px-5 py-4">
                    <StatusBadge value={report.type} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge value={report.status} />
                  </td>
                  <td className="max-w-52 px-5 py-4 text-sm text-slate-600">
                    <span className="line-clamp-1">
                      {report.location || "-"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {reporter.name || reporter.email || "-"}
                  </td>
                  {!compact ? (
                    <>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onView?.(report)}
                            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete?.(report)}
                            className="inline-flex h-9 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
