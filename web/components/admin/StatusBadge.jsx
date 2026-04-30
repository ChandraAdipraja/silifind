"use client";

const variants = {
  lost: "bg-amber-50 text-amber-700 ring-amber-200",
  found: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  open: "bg-sky-50 text-sky-700 ring-sky-200",
  claimed: "bg-violet-50 text-violet-700 ring-violet-200",
  returned: "bg-teal-50 text-teal-700 ring-teal-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  admin: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  operator: "bg-blue-50 text-blue-700 ring-blue-200",
  user: "bg-slate-50 text-slate-700 ring-slate-200",
};

const labels = {
  lost: "Lost",
  found: "Found",
  open: "Open",
  claimed: "Claimed",
  returned: "Returned",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  admin: "Admin",
  operator: "Operator",
  user: "User",
};

export default function StatusBadge({ value }) {
  const key = String(value || "unknown").toLowerCase();

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
        variants[key] || "bg-slate-50 text-slate-700 ring-slate-200"
      }`}
    >
      {labels[key] || key.replaceAll("_", " ")}
    </span>
  );
}
