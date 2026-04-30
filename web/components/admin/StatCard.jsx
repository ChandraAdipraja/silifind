"use client";

export default function StatCard({ title, value, icon: Icon, tone = "teal" }) {
  const tones = {
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        {Icon ? (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              tones[tone] || tones.teal
            }`}
          >
            <Icon size={24} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
