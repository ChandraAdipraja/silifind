"use client";

import { useEffect, useState } from "react";
import { Edit3, LockKeyhole, Mail, Phone, UserRound, X } from "lucide-react";
import api from "../../../lib/api";
import StatusBadge from "../../../components/admin/StatusBadge";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", phoneNumber: "" });
  const [passwordForm, setPasswordForm] = useState({
    confirmPassword: "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const applyUser = (profile) => {
    setUser(profile);
    setEditForm({
      name: profile?.name || "",
      phoneNumber: profile?.phoneNumber || "",
    });
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        const profile = response.data?.user || response.data?.data || response.data;
        setUser(profile);
        setEditForm({
          name: profile?.name || "",
          phoneNumber: profile?.phoneNumber || "",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateProfile = async () => {
    setProcessing(true);
    setMessage("");
    setError("");

    try {
      const response = await api.put("/auth/profile", {
        name: editForm.name.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
      });
      applyUser(response.data?.user || response.data?.data || response.data);
      setEditOpen(false);
      setMessage("Profile berhasil diperbarui.");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memperbarui profile.");
    } finally {
      setProcessing(false);
    }
  };

  const resetPassword = async () => {
    setProcessing(true);
    setMessage("");
    setError("");

    try {
      await api.put("/auth/reset-password", passwordForm);
      setPasswordForm({
        confirmPassword: "",
        currentPassword: "",
        newPassword: "",
      });
      setPasswordOpen(false);
      setMessage("Password berhasil diperbarui.");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memperbarui password.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm font-semibold text-slate-500">
        Loading profile...
      </div>
    );
  }

  const initial = (user?.name || user?.email || "S").charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl space-y-5">
      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 text-4xl font-bold text-white shadow-sm">
            {initial}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-slate-950">
                {user?.name || "SiliFind Staff"}
              </h2>
              <StatusBadge value={user?.role} />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Akun web dashboard SiliFind.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
            >
              <Edit3 size={17} />
              Edit Profile
            </button>
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <LockKeyhole size={17} />
              Reset Password
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <ProfileItem icon={Mail} label="Email" value={user?.email} />
          <ProfileItem
            icon={Phone}
            label="Phone Number"
            value={user?.phoneNumber}
          />
          <ProfileItem icon={UserRound} label="Role" value={user?.role} />
        </div>
      </div>

      <ProfileModal
        open={editOpen}
        title="Edit Profile"
        description="Perbarui nama lengkap dan nomor telepon akun dashboard."
        onClose={() => setEditOpen(false)}
      >
        <Field
          label="Nama Lengkap"
          value={editForm.name}
          onChange={(value) =>
            setEditForm((current) => ({ ...current, name: value }))
          }
        />
        <Field
          label="Phone Number"
          value={editForm.phoneNumber}
          onChange={(value) =>
            setEditForm((current) => ({ ...current, phoneNumber: value }))
          }
        />
        <ModalActions
          loading={processing}
          confirmText="Save Profile"
          onClose={() => setEditOpen(false)}
          onConfirm={updateProfile}
        />
      </ProfileModal>

      <ProfileModal
        open={passwordOpen}
        title="Reset Password"
        description="Masukkan password saat ini sebelum membuat password baru."
        onClose={() => setPasswordOpen(false)}
      >
        <Field
          label="Password Saat Ini"
          type="password"
          value={passwordForm.currentPassword}
          onChange={(value) =>
            setPasswordForm((current) => ({
              ...current,
              currentPassword: value,
            }))
          }
        />
        <Field
          label="Password Baru"
          type="password"
          value={passwordForm.newPassword}
          onChange={(value) =>
            setPasswordForm((current) => ({ ...current, newPassword: value }))
          }
        />
        <Field
          label="Konfirmasi Password Baru"
          type="password"
          value={passwordForm.confirmPassword}
          onChange={(value) =>
            setPasswordForm((current) => ({
              ...current,
              confirmPassword: value,
            }))
          }
        />
        <ModalActions
          loading={processing}
          confirmText="Update Password"
          onClose={() => setPasswordOpen(false)}
          onConfirm={resetPassword}
        />
      </ProfileModal>
    </div>
  );
}

function ProfileModal({ children, description, onClose, open, title }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
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

        <div className="mt-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, onChange, type = "text", value }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
      />
    </div>
  );
}

function ModalActions({ confirmText, loading, onClose, onConfirm }) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Processing..." : confirmText}
      </button>
    </div>
  );
}

function ProfileItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
          <Icon size={19} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
