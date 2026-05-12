"use client";

import { useEffect, useState } from "react";
import { ImageOff, X } from "lucide-react";
import api from "../../../lib/api";
import ClaimsTable from "../../../components/admin/ClaimsTable";
import ConfirmationModal from "../../../components/admin/ConfirmationModal";
import StatusBadge from "../../../components/admin/StatusBadge";

const toList = (payload) =>
  Array.isArray(payload)
    ? payload
    : payload?.data && Array.isArray(payload.data)
      ? payload.data
      : payload?.claims || [];

const claimantOf = (claim) => claim?.claimant || claim?.user || {};
const reportOf = (claim) => claim?.report || claim?.item || claim?.claimedItem || {};

export default function ClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadClaims = async () => {
    try {
      const response = await api.get("/claims");
      setClaims(toList(response.data));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat klaim.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialClaims = async () => {
      try {
        const response = await api.get("/claims");
        setClaims(toList(response.data));
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Gagal memuat klaim.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialClaims();
  }, []);

  const processClaim = async () => {
    if (!confirm?.claim) return;
    const id = confirm.claim._id || confirm.claim.id;
    const deleting = confirm.action === "delete";

    setProcessing(true);
    setMessage("");
    setError("");

    try {
      if (deleting) {
        await api.delete(`/claims/${id}`);
      } else {
        await api.put(`/claims/${id}/${confirm.action}`);
      }

      setMessage(
        deleting
          ? "Klaim berhasil dihapus."
          : confirm.action === "approve"
          ? "Klaim berhasil disetujui."
          : "Klaim berhasil ditolak."
      );
      setConfirm(null);
      setSelected((current) =>
        (current?._id || current?.id) === id ? null : current,
      );
      await loadClaims();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (deleting ? "Gagal menghapus klaim." : "Gagal memproses klaim."),
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Claims Verification Queue
            </h2>
            <p className="text-sm text-slate-500">
              Tinjau bukti klaim dan proses approve atau reject.
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 ring-1 ring-amber-200">
            {claims.filter((claim) => String(claim.status).toLowerCase() === "pending").length} pending
          </div>
        </div>
      </div>

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
        <div className="text-sm font-semibold text-slate-500">Loading claims...</div>
      ) : (
        <ClaimsTable
          claims={claims}
          onView={setSelected}
          onApprove={(claim) => setConfirm({ action: "approve", claim })}
          onDelete={(claim) => setConfirm({ action: "delete", claim })}
          onReject={(claim) => setConfirm({ action: "reject", claim })}
        />
      )}

      {selected ? (
        <ClaimDetailModal claim={selected} onClose={() => setSelected(null)} />
      ) : null}

      <ConfirmationModal
        open={Boolean(confirm)}
        title={
          confirm?.action === "delete"
            ? "Delete claim?"
            : confirm?.action === "approve"
              ? "Approve claim?"
              : "Reject claim?"
        }
        description={
          confirm?.action === "delete"
            ? "Klaim ini akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan."
            : confirm?.action === "approve"
            ? "Claim ini akan disetujui dan status klaim akan diperbarui."
            : "Claim ini akan ditolak dan claimant perlu mengajukan bukti ulang bila diperlukan."
        }
        confirmText={
          confirm?.action === "delete"
            ? "Delete"
            : confirm?.action === "approve"
              ? "Approve"
              : "Reject"
        }
        intent={confirm?.action === "approve" ? "primary" : "danger"}
        loading={processing}
        onClose={() => setConfirm(null)}
        onConfirm={processClaim}
      />
    </div>
  );
}

function ClaimDetailModal({ claim, onClose }) {
  const claimant = claimantOf(claim);
  const report = reportOf(claim);
  const reportImage = report.imageUrl || report.image;
  const proofImage = claim.proofImageUrl || claim.proofImage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Claim Detail</h2>
            <p className="text-sm text-slate-500">Data claimant, barang, dan bukti klaim.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Claimant</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">{claimant.name || "-"}</h3>
              <p className="mt-1 text-sm text-slate-600">{claimant.email || "-"}</p>
              <p className="mt-1 text-sm text-slate-600">{claimant.phoneNumber || "-"}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
              <div className="mt-2"><StatusBadge value={claim.status} /></div>
            </div>

            <Info label="Proof Description" value={claim.proofDescription} />
            <Info
              label="Submitted Date"
              value={claim.createdAt ? new Date(claim.createdAt).toLocaleString("id-ID") : "-"}
            />
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Claimed Item</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">{report.title || "-"}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {[report.category, report.location].filter(Boolean).join(" • ") || "-"}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Preview title="Report Image" src={reportImage} />
              <Preview title="Proof Image" src={proofImage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Preview({ title, src }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      {src ? (
        <img src={src} alt={title} className="h-52 w-full rounded-2xl object-cover ring-1 ring-slate-200" />
      ) : (
        <div className="flex h-52 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <ImageOff size={28} />
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{value || "-"}</p>
    </div>
  );
}
