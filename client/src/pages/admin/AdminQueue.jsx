// pages/admin/AdminQueue.jsx
// ----------------------------------------------------------------------------
// Admin moderation queue. Lists submissions by status; for pending ones the
// admin can Approve (optionally uploading crop photos) or Reject (with reason).
//   GET   /api/submissions?status=...
//   PATCH /api/submissions/:id/approve  { photos }
//   PATCH /api/submissions/:id/reject   { rejectionReason }
// ----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { apiGet, apiPatch, apiDel } from "../../api/client.js";
import { useLang } from "../../context/LanguageContext.jsx";
import AdminNav from "../../components/admin/AdminNav.jsx";
import ImageUploader from "../../components/ImageUploader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import Lightbox from "../../components/Lightbox.jsx";

// ── A single submission card ────────────────────────────────────────────────
function QueueCard({ submission, onDone }) {
  const { lang, t } = useLang();
  const [mode, setMode] = useState(null); // null | "approve" | "reject"
  const [selected, setSelected] = useState([]); // farmer photos chosen to publish
  const [adminPhotos, setAdminPhotos] = useState([]); // extra admin uploads
  const [reason, setReason] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null); // big-size viewer

  const isPending = submission.status === "pending";
  const farmerPhotos = submission.photos || [];

  // Enter approve mode with ALL the farmer's photos pre-selected (admin can
  // then deselect any, or clear all).
  const startApprove = () => {
    setSelected(farmerPhotos);
    setMode("approve");
  };

  const toggle = (url) =>
    setSelected((s) => (s.includes(url) ? s.filter((u) => u !== url) : [...s, url]));

  const approve = async () => {
    setWorking(true);
    setError(null);
    try {
      // Final published photos = chosen farmer photos + any admin additions.
      const photos = [...selected, ...adminPhotos];
      await apiPatch(`/api/submissions/${submission._id}/approve`, { photos });
      onDone();
    } catch (err) {
      setError(err.message);
      setWorking(false);
    }
  };

  const reject = async () => {
    setWorking(true);
    setError(null);
    try {
      await apiPatch(`/api/submissions/${submission._id}/reject`, {
        rejectionReason: reason,
      });
      onDone();
    } catch (err) {
      setError(err.message);
      setWorking(false);
    }
  };

  // Permanently remove this submission from the queue (any status).
  const remove = async () => {
    if (!window.confirm(t("queue.confirmDelete"))) return;
    try {
      await apiDel(`/api/submissions/${submission._id}`);
      onDone();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 min-w-0">
          <span className="font-semibold text-gray-800 break-words">
            {submission.farmerName}
          </span>
          <span className="text-sm text-green-700 font-medium">
            📞 {submission.phone}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StatusBadge status={submission.status} />
          <button
            onClick={remove}
            className="text-xs text-red-600 hover:underline"
          >
            {t("queue.delete")}
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600 mt-2 space-y-0.5">
        <p>
          <span className="text-gray-400">{t("queue.product")}:</span>{" "}
          {submission.product?.name?.[lang] || "—"}
        </p>
        <p>
          <span className="text-gray-400">{t("queue.yield")}:</span>{" "}
          {submission.yield}
        </p>
        {submission.notes && (
          <p>
            <span className="text-gray-400">{t("queue.notes")}:</span>{" "}
            {submission.notes}
          </p>
        )}
        {submission.status === "rejected" && submission.rejectionReason && (
          <p className="text-red-600">
            {t("queue.rejectedReason")} {submission.rejectionReason}
          </p>
        )}
      </div>

      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}

      {/* Action buttons — only for pending submissions. */}
      {isPending && mode === null && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={startApprove}
            className="bg-green-600 hover:bg-green-700 text-white text-sm rounded px-4 py-1.5"
          >
            {t("queue.approve")}
          </button>
          <button
            onClick={() => setMode("reject")}
            className="bg-red-50 hover:bg-red-100 text-red-700 text-sm rounded px-4 py-1.5"
          >
            {t("queue.reject")}
          </button>
        </div>
      )}

      {/* Approve panel: pick which farmer photos to publish + add more. */}
      {isPending && mode === "approve" && (
        <div className="mt-3 border-t border-gray-100 pt-3 space-y-3">
          {/* Farmer-submitted photos — selectable. */}
          {farmerPhotos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-700">{t("queue.farmerPhotos")}</p>
                <div className="text-xs">
                  <button
                    type="button"
                    onClick={() => setSelected(farmerPhotos)}
                    className="text-green-700 mr-3"
                  >
                    {t("queue.selectAll")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected([])}
                    className="text-gray-500"
                  >
                    {t("queue.clearAll")}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {farmerPhotos.map((url, i) => {
                  const on = selected.includes(url);
                  return (
                    <div key={i} className="relative">
                      {/* Tap the image to include/exclude it. */}
                      <button
                        type="button"
                        onClick={() => toggle(url)}
                        className={`block rounded overflow-hidden border-2 ${
                          on ? "border-green-600" : "border-transparent opacity-50"
                        }`}
                      >
                        <img src={url} alt="" className="h-28 w-28 object-cover" />
                        {on && (
                          <span className="absolute top-0 left-0 bg-green-600 text-white text-[10px] px-1 rounded-br">
                            ✓
                          </span>
                        )}
                      </button>
                      {/* 🔍 view full size without changing selection. */}
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(i)}
                        aria-label="View full size"
                        className="absolute bottom-1 right-1 bg-black/60 hover:bg-black/80 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center"
                      >
                        🔍
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin can add additional photos. */}
          <div>
            <p className="text-sm text-gray-700 mb-1">{t("queue.addMore")}</p>
            <ImageUploader value={adminPhotos} onChange={setAdminPhotos} />
          </div>

          <div className="flex gap-2">
            <button
              onClick={approve}
              disabled={working}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm rounded px-4 py-1.5"
            >
              {working ? t("queue.working") : t("queue.confirmApprove")}
            </button>
            <button
              onClick={() => setMode(null)}
              className="text-gray-500 text-sm px-3"
            >
              {t("queue.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Reject panel: reason + confirm. */}
      {isPending && mode === "reject" && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("queue.rejectReason")}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={reject}
              disabled={working}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm rounded px-4 py-1.5"
            >
              {working ? t("queue.working") : t("queue.confirmReject")}
            </button>
            <button
              onClick={() => setMode(null)}
              className="text-gray-500 text-sm px-3"
            >
              {t("queue.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Full-size viewer for the farmer's submitted photos. */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={farmerPhotos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

// ── The queue page ──────────────────────────────────────────────────────────
export default function AdminQueue() {
  const { t } = useLang();
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const load = () => {
    setLoading(true);
    apiGet(`/api/submissions?status=${status}`)
      .then((list) => setItems(list))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  // Bulk-delete every submission currently shown (the whole active tab).
  const clearAll = async () => {
    if (!window.confirm(t("queue.confirmClearAll", { n: items.length }))) return;
    setClearing(true);
    try {
      await Promise.all(items.map((s) => apiDel(`/api/submissions/${s._id}`)));
    } catch {
      // ignore individual failures; load() resyncs from the server
    } finally {
      setClearing(false);
      load();
    }
  };

  const tabBtn = (key) =>
    `px-3 py-1.5 rounded-lg text-sm ${
      status === key
        ? "bg-green-600 text-white"
        : "bg-white text-gray-600 shadow hover:text-green-700"
    }`;

  return (
    <div>
      <AdminNav />
      <div className="flex items-center justify-between mb-4 gap-2">
        <h1 className="text-xl font-bold text-green-700">{t("queue.title")}</h1>
        {items.length > 0 && (
          <button
            onClick={clearAll}
            disabled={clearing}
            className="bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-700 text-sm rounded px-3 py-1.5"
          >
            {clearing ? t("queue.clearing") : `${t("queue.clearAll")} (${items.length})`}
          </button>
        )}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setStatus("pending")} className={tabBtn("pending")}>
          {t("queue.filterPending")}
        </button>
        <button onClick={() => setStatus("approved")} className={tabBtn("approved")}>
          {t("queue.filterApproved")}
        </button>
        <button onClick={() => setStatus("rejected")} className={tabBtn("rejected")}>
          {t("queue.filterRejected")}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">{t("admin.loading")}</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">{t("queue.empty")}</p>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <QueueCard key={s._id} submission={s} onDone={load} />
          ))}
        </div>
      )}
    </div>
  );
}
