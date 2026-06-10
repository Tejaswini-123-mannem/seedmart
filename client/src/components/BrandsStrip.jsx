// components/BrandsStrip.jsx
// ----------------------------------------------------------------------------
// A row of brand-name chips that link into the catalog pre-filtered to that
// brand's products. Brands are passed in (Home fetches them from
// GET /api/products/brands — derived from product companies).
// ----------------------------------------------------------------------------

import { Link } from "react-router-dom";

export default function BrandsStrip({ brands }) {
  if (!brands || brands.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {brands.map((brand) => (
        <Link
          key={brand}
          to={`/catalog?search=${encodeURIComponent(brand)}`}
          className="bg-white shadow rounded-lg px-4 py-3 text-gray-700 font-medium hover:shadow-md hover:text-green-700 transition"
        >
          {brand}
        </Link>
      ))}
    </div>
  );
}
