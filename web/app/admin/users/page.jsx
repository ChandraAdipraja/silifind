"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, Users } from "lucide-react";
import api from "../../../lib/api";
import AccessDenied from "../../../components/admin/AccessDenied";
import ConfirmationModal from "../../../components/admin/ConfirmationModal";
import UsersTable from "../../../components/admin/UsersTable";

const toList = (payload) =>
  Array.isArray(payload)
    ? payload
    : payload?.data && Array.isArray(payload.data)
      ? payload.data
      : payload?.users || [];

const getUserId = (user) => user?._id || user?.id;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [denied, setDenied] = useState(false);

  const loadUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(toList(response.data));
      setError("");
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setDenied(true);
        return;
      }

      setError(err.response?.data?.message || "Gagal memuat data users.");
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        const [profileResponse, usersResponse] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/users"),
        ]);
        const profile =
          profileResponse.data?.user ||
          profileResponse.data?.data ||
          profileResponse.data;

        if (profile?.role !== "admin") {
          setDenied(true);
          return;
        }

        setCurrentUser(profile);
        setUsers(toList(usersResponse.data));
        setError("");
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setDenied(true);
          return;
        }

        setError(err.response?.data?.message || "Gagal memuat data users.");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return users;

    return users.filter((user) =>
      [user.name, user.email].some((field) =>
        String(field || "").toLowerCase().includes(keyword),
      ),
    );
  }, [users, search]);

  const openRoleConfirmation = (user, nextRole) => {
    if (!nextRole || nextRole === user.role) return;

    setMessage("");
    setError("");
    setConfirm({ user, nextRole });
  };

  const updateRole = async () => {
    if (!confirm?.user || !confirm?.nextRole) return;

    const id = getUserId(confirm.user);

    setProcessing(true);
    setMessage("");
    setError("");

    try {
      await api.put(`/users/${id}/role`, {
        role: confirm.nextRole,
      });
      setMessage("Role user berhasil diperbarui.");
      setConfirm(null);
      await loadUsers();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setDenied(true);
        return;
      }

      setError(err.response?.data?.message || "Gagal memperbarui role user.");
    } finally {
      setProcessing(false);
    }
  };

  if (denied) {
    return (
      <AccessDenied message="Akses ditolak. Users Management hanya dapat diakses oleh admin." />
    );
  }

  const currentUserId = getUserId(currentUser);
  const changingSelf =
    confirm?.user && String(getUserId(confirm.user)) === String(currentUserId);
  const demotingSelf = changingSelf && confirm?.nextRole !== "admin";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Users Management
              </h2>
              <p className="text-sm text-slate-500">
                Kelola role pengguna SiliFind dari dashboard admin.
              </p>
            </div>
          </div>

          <div className="relative min-w-0 sm:w-80">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            />
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard title="Total Users" value={users.length} />
        <SummaryCard
          title="Admins"
          value={users.filter((user) => user.role === "admin").length}
        />
        <SummaryCard
          title="Operators"
          value={users.filter((user) => user.role === "operator").length}
        />
      </section>

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading users...
          </p>
        </div>
      ) : (
        <UsersTable
          users={filteredUsers}
          currentUserId={currentUserId}
          disabled={processing}
          onRoleChange={openRoleConfirmation}
        />
      )}

      <ConfirmationModal
        open={Boolean(confirm)}
        title="Ubah role user?"
        description={`Apakah kamu yakin ingin mengubah role user ini menjadi ${confirm?.nextRole || ""}?${
          demotingSelf
            ? " Kamu sedang mengubah role akun admin yang sedang dipakai. Setelah dikonfirmasi, akses admin kamu dapat hilang."
            : ""
        }`}
        confirmText="Confirm"
        intent={demotingSelf ? "danger" : "primary"}
        loading={processing}
        onClose={() => setConfirm(null)}
        onConfirm={updateRole}
      />
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <ShieldCheck size={21} />
        </div>
      </div>
    </div>
  );
}
