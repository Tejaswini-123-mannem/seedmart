// components/SocialLinks.jsx
// ----------------------------------------------------------------------------
// A row of social media icon-links, read from the admin-managed Settings.
// Only platforms that actually have a URL are rendered.
// ----------------------------------------------------------------------------

import { useSettings } from "../context/SettingsContext.jsx";

// platform key → { label shown in the badge, accessible name, colour }
const PLATFORMS = [
  { key: "facebook", label: "f", name: "Facebook", cls: "bg-blue-600" },
  { key: "instagram", label: "IG", name: "Instagram", cls: "bg-pink-600" },
  { key: "youtube", label: "▶", name: "YouTube", cls: "bg-red-600" },
  { key: "whatsapp", label: "WA", name: "WhatsApp", cls: "bg-green-600" },
];

export default function SocialLinks({ className = "" }) {
  const { settings } = useSettings();
  const links = settings?.socialLinks || {};

  const present = PLATFORMS.filter((p) => links[p.key]);
  if (present.length === 0) return null;

  return (
    <div className={`flex gap-2 ${className}`}>
      {present.map((p) => (
        <a
          key={p.key}
          href={links[p.key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={p.name}
          title={p.name}
          className={`${p.cls} text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90`}
        >
          {p.label}
        </a>
      ))}
    </div>
  );
}
