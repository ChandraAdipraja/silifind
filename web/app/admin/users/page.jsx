"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, UserRound, Users, X } from "lucide-react";
import api from "../../../lib/api";
import AccessDenied from "../../../components/admin/AccessDenied";
import ConfirmationModal from "../../../components/admin/ConfirmationModal";
import RoleSelect from "../../../components/admin/RoleSelect";
import StatusBadge from "../../../components/admin/StatusBadge";
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
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    role: "user",
  });
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

  const openEditModal = (user) => {
    setMessage("");
    setError("");
    setEditing(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || user.phone || "",
      role: user.role || "user",
    });
  };

  const updateUser = async () => {
    if (!editing) return;

    const id = getUserId(editing);

    setProcessing(true);
    setMessage("");
    setError("");

    try {
      await api.put(`/users/${id}`, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        role: editForm.role,
      });
      setMessage("Data user berhasil diperbarui.");
      setEditing(null);
      await loadUsers();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setDenied(true);
        return;
      }

      setError(err.response?.data?.message || "Gagal memperbarui data user.");
    } finally {
      setProcessing(false);
    }
  };

  const deleteUser = async () => {
    if (!deleteConfirm) return;

    const id = getUserId(deleteConfirm);

    setProcessing(true);
    setMessage("");
    setError("");

    try {
      await api.delete(`/users/${id}`);
      setMessage("User berhasil dihapus.");
      setDeleteConfirm(null);
      await loadUsers();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setDenied(true);
        return;
      }

      setError(err.response?.data?.message || "Gagal menghapus user.");
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
  const editingSelf =
    editing && String(getUserId(editing)) === String(currentUserId);
  const demotingSelf = editingSelf && editForm.role !== "admin";

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
          onView={setSelected}
          onEdit={openEditModal}
          onDelete={setDeleteConfirm}
        />
      )}

      {selected ? (
        <UserDetailModal user={selected} onClose={() => setSelected(null)} />
      ) : null}

      {editing ? (
        <UserEditModal
          user={editing}
          form={editForm}
          loading={processing}
          demotingSelf={demotingSelf}
          onChange={setEditForm}
          onClose={() => setEditing(null)}
          onSubmit={updateUser}
        />
      ) : null}

      <ConfirmationModal
        open={Boolean(deleteConfirm)}
        title="Hapus user?"
        description={`User ${
          deleteConfirm?.name || deleteConfirm?.email || "ini"
        } akan dihapus dari sistem.`}
        confirmText="Delete"
        intent="danger"
        loading={processing}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={deleteUser}
      />
    </div>
  );
}

function UserDetailModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <UserRound size={21} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">User Detail</h2>
              <p className="text-sm text-slate-500">Informasi akun pengguna.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close user detail"
          >
            <X size={19} />
          </button>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <Info label="Name" value={user.name} />
          <Info label="Email" value={user.email} />
          <Info label="Phone Number" value={user.phoneNumber || user.phone} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Role
            </p>
            <div className="mt-2">
              <StatusBadge value={user.role} />
            </div>
          </div>
          <Info
            label="Created At"
            value={
              user.createdAt ? new Date(user.createdAt).toLocaleString("id-ID") : "-"
            }
          />
          <Info
            label="User ID"
            value={user._id || user.id}
          />
        </div>
      </div>
    </div>
  );
}

function UserEditModal({
  form,
  loading,
  demotingSelf,
  onChange,
  onClose,
  onSubmit,
}) {
  const updateField = (field, value) => {
    onChange((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Edit User</h2>
            <p className="text-sm text-slate-500">Perbarui data akun pengguna.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close edit user"
          >
            <X size={19} />
          </button>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <Field
            label="Name"
            value={form.name}
            onChange={(value) => updateField("name", value)}
            required
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) => updateField("email", value)}
            required
          />
          <Field
            label="Phone Number"
            value={form.phoneNumber}
            onChange={(value) => updateField("phoneNumber", value)}
            required
          />
          <div>
            <label className="text-sm font-semibold text-slate-700">Role</label>
            <div className="mt-2">
              <RoleSelect
                value={form.role}
                disabled={loading}
                onChange={(role) => updateField("role", role)}
              />
            </div>
          </div>
        </div>

        {demotingSelf ? (
          <div className="mx-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Kamu sedang mengubah role akun admin yang sedang dipakai. Setelah
            disimpan, akses admin kamu dapat hilang.
          </div>
        ) : null}

        <div className="flex justify-end gap-3 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, onChange, type = "text", value, required = false }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
      />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm leading-6 text-slate-700">
        {value || "-"}
      </p>
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
