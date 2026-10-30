import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { qrTypes } from "@/lib/qr-types";
import { alternatesFor } from "@/lib/site";

const pages: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  ...qrTypes.map((t) => ({ path: `/qr/${t}`, priority: 0.9 })),
  { path: "/scanner", priority: 0.8 },
  { path: "/pricing", priority: 0.7 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return pages.flatMap(({ path, priority }) =>
    locales.map((locale) => {
      const { canonical, languages } = alternatesFor(locale, path);
      return { url: canonical, lastModified, changeFrequency: "weekly" as const, priority, alternates: { languages } };
    }),
  );
}
