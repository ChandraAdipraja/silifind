"use client";

const roles = ["user", "operator", "admin"];

export default function RoleSelect({ value, disabled = false, onChange }) {
  return (
    <select
      value={value || "user"}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.value)}
      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      aria-label="Change user role"
    >
      {roles.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
}
