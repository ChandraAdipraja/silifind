"use client";

import { CheckCircle2, Eye, ImageOff, Trash2, XCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";

const getClaimant = (claim) => claim?.claimant || claim?.user || {};
const getReport = (claim) =>
  claim?.report || claim?.item || claim?.claimedItem || {};

export default function ClaimsTable({
  claims = [],
  compact = false,
  onApprove,
  onDelete,
  onReject,
  onView,
}) {
  if (!claims.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        Belum ada klaim untuk diverifikasi.
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
                Claimant
              </th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Claimed Item
              </th>
              {!compact ? (
                <>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Proof Description
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Proof Image
                  </th>
                </>
              ) : null}
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Submitted Date
              </th>
              {!compact ? (
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {claims.map((claim) => {
              const claimant = getClaimant(claim);
              const report = getReport(claim);
              const pending = String(claim.status).toLowerCase() === "pending";

              return (
                <tr
                  key={claim._id || claim.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-950">
                      {claimant.name || "-"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {claimant.email || "-"}
                    </p>
                  </td>
                  <td className="max-w-56 px-5 py-4 text-sm font-semibold text-slate-800">
                    <span className="line-clamp-1">{report.title || "-"}</span>
                  </td>
                  {!compact ? (
                    <>
                      <td className="max-w-72 px-5 py-4 text-sm text-slate-600">
                        <span className="line-clamp-2">
                          {claim.proofDescription || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {claim.proofImage || claim.proofImageUrl ? (
                          <img
                            src={claim.proofImageUrl || claim.proofImage}
                            alt="Proof"
                            className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                            <ImageOff size={18} />
                          </div>
                        )}
                      </td>
                    </>
                  ) : null}
                  <td className="px-5 py-4">
                    <StatusBadge value={claim.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {claim.createdAt
                      ? new Date(claim.createdAt).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                  {!compact ? (
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onView?.(claim)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Eye size={16} />
                        </button>
                        {pending ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onApprove?.(claim)}
                              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
                            >
                              <CheckCircle2 size={16} />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => onReject?.(claim)}
                              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-500">
                            Processed
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onDelete?.(claim)}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
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
