"use client";

import { AlertTriangle, X } from "lucide-react";

export default function ConfirmationModal({
  open,
  title,
  description,
  confirmText = "Confirm",
  intent = "primary",
  loading = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  const isDanger = intent === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                isDanger ? "bg-rose-50 text-rose-600" : "bg-teal-50 text-teal-600"
              }`}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
