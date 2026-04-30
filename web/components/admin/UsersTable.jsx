"use client";

import { UserRound } from "lucide-react";
import RoleSelect from "./RoleSelect";
import StatusBadge from "./StatusBadge";

const getUserId = (user) => user?._id || user?.id;

export default function UsersTable({
  users = [],
  currentUserId,
  disabled = false,
  onRoleChange,
}) {
  if (!users.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <UserRound size={22} />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-700">
          Belum ada user untuk ditampilkan.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Data user akan muncul setelah tersedia di database.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50">
            <tr>
              {["Name", "Email", "Phone Number", "Role", "Created At", "Actions"].map(
                (column) => (
                  <th
                    key={column}
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {column}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {users.map((user) => {
              const userId = getUserId(user);
              const isCurrentUser = String(userId) === String(currentUserId);

              return (
                <tr key={userId} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                        {(user.name || user.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {user.name || "-"}
                        </p>
                        {isCurrentUser ? (
                          <p className="mt-1 text-xs font-medium text-teal-600">
                            Current admin
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {user.email || "-"}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {user.phoneNumber || user.phone || "-"}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge value={user.role} />
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                  <td className="px-5 py-4">
                    <RoleSelect
                      value={user.role}
                      disabled={disabled}
                      onChange={(role) => onRoleChange?.(user, role)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
