// components/StatusBadge.jsx
// ----------------------------------------------------------------------------
// A coloured pill for a submission's moderation status. Same pattern as
// StockBadge; label comes from the i18n dictionary (status.* keys).
// ----------------------------------------------------------------------------

import { useLang } from "../context/LanguageContext.jsx";

const CLASSES = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  const { t } = useLang();
  const cls = CLASSES[status] || CLASSES.pending;
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}
    >
      {t(`status.${status}`)}
    </span>
  );
}
