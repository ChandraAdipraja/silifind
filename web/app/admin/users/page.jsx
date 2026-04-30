"use client";

import { ShieldAlert, Users } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-800">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 shrink-0" size={20} />
          <p className="text-sm font-medium leading-6">
            User management endpoint belum tersedia. Halaman ini disiapkan untuk
            pengembangan role management.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Users Management</h2>
            <p className="text-sm text-slate-500">Struktur tabel siap untuk integrasi API.</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <Users size={22} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                {["Name", "Email", "Phone Number", "Role", "Created At", "Actions"].map((column) => (
                  <th key={column} className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <p className="text-sm font-semibold text-slate-700">Belum ada data user.</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Integrasikan endpoint users untuk menampilkan daftar pengguna dan role.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
