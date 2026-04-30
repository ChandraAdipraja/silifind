"use client";

import { ShieldAlert } from "lucide-react";

export default function AccessDenied({
  message = "Akses ditolak. Dashboard web hanya untuk admin dan operator. Silakan gunakan aplikasi mobile SiliFind.",
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <ShieldAlert size={28} />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-950">
          Akses Ditolak
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
      </div>
    </div>
  );
}
