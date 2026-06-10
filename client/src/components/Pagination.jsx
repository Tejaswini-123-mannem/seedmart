// components/Pagination.jsx
// ----------------------------------------------------------------------------
// Reusable Prev / Next control. Stateless: it just reports the requested page
// to the parent via onPageChange. Buttons disable at the boundaries.
// ----------------------------------------------------------------------------

import { useLang } from "../context/LanguageContext.jsx";

export default function Pagination({ page, pages, onPageChange }) {
  const { t } = useLang();
  if (pages <= 1) return null; // nothing to paginate

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1 rounded bg-white shadow disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t("pagination.prev")}
      </button>

      <span className="text-sm text-gray-600">
        {t("pagination.pageOf", { page, pages })}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="px-3 py-1 rounded bg-white shadow disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t("pagination.next")}
      </button>
    </div>
  );
}
