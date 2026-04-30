"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Mail, Phone, UserRound } from "lucide-react";
import api from "../../../lib/api";
import StatusBadge from "../../../components/admin/StatusBadge";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        setUser(response.data?.user || response.data?.data || response.data);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  if (loading) {
    return <div className="text-sm font-semibold text-slate-500">Loading profile...</div>;
  }

  const initial = (user?.name || user?.email || "S").charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 text-4xl font-bold text-white shadow-sm">
            {initial}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-slate-950">{user?.name || "SiliFind Staff"}</h2>
              <StatusBadge value={user?.role} />
            </div>
            <p className="mt-2 text-sm text-slate-500">Akun web dashboard SiliFind.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <ProfileItem icon={Mail} label="Email" value={user?.email} />
          <ProfileItem icon={Phone} label="Phone Number" value={user?.phoneNumber} />
          <ProfileItem icon={UserRound} label="Role" value={user?.role} />
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
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
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{value || "-"}</p>
        </div>
      </div>
    </div>
  );
}
