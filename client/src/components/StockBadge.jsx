// components/StockBadge.jsx
// ----------------------------------------------------------------------------
// A small coloured pill showing a product's availability. The label text comes
// from the shared i18n dictionary (stock.* keys) so it matches the catalog
// dropdown and translates with the rest of the UI.
// ----------------------------------------------------------------------------

import { useLang } from "../context/LanguageContext.jsx";

// Colour scheme per status; the label is looked up via t("stock.<status>").
const CLASSES = {
  inStock: "bg-green-100 text-green-800",
  limitedStock: "bg-amber-100 text-amber-800",
  outOfStock: "bg-red-100 text-red-700",
};

export default function StockBadge({ status }) {
  const { t } = useLang();
  const cls = CLASSES[status] || CLASSES.inStock;

  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}
    >
      {t(`stock.${status}`)}
    </span>
  );
}
