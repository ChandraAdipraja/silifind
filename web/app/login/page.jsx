"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, SearchCheck } from "lucide-react";
import api from "../../lib/api";
import AccessDenied from "../../components/admin/AccessDenied";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [denied, setDenied] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setDenied(false);

    try {
      const loginResponse = await api.post("/auth/login", form);
      const token =
        loginResponse.data?.token ||
        loginResponse.data?.accessToken ||
        loginResponse.data?.data?.token;

      if (!token) {
        throw new Error("Token tidak ditemukan pada response login.");
      }

      localStorage.setItem("token", token);

      let profile = loginResponse.data?.user || loginResponse.data?.data?.user;

      if (!profile) {
        const profileResponse = await api.get("/auth/profile");
        profile =
          profileResponse.data?.user ||
          profileResponse.data?.data ||
          profileResponse.data;
      }

      if (!["admin", "operator"].includes(profile?.role)) {
        localStorage.removeItem("token");
        setDenied(true);
        return;
      }

      router.replace("/admin/dashboard");
    } catch (err) {
      localStorage.removeItem("token");
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login gagal. Periksa email dan password."
      );
    } finally {
      setLoading(false);
    }
  };

  if (denied) return <AccessDenied />;

  return (
    <main className="flex min-h-screen bg-slate-50">
      <section className="hidden flex-1 items-center justify-center bg-slate-950 p-12 text-white lg:flex">
        <div className="max-w-lg">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-500/20">
            <SearchCheck size={34} />
          </div>
          <h1 className="mt-8 text-5xl font-semibold tracking-tight">
            SiliFind Operator Dashboard
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Kelola laporan kehilangan, verifikasi klaim barang ditemukan, dan
            bantu proses pengembalian barang kampus dengan cepat.
          </p>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
              Admin / Operator
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Masuk ke Dashboard
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Akses web hanya tersedia untuk admin dan operator SiliFind.
            </p>
          </div>

          {error ? (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <div className="relative mt-2">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                  placeholder="admin@silifind.ac.id"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Password
              </span>
              <div className="relative mt-2">
                <LockKeyhole
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                  placeholder="Masukkan password"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
