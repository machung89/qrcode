import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { qrTypes } from "@/lib/qr-types";
import { blogIndexAlternates, blogLocales, postAlternates, postsFor } from "@/lib/blog";
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
  const staticPages = pages.flatMap(({ path, priority }) =>
    locales.map((locale) => {
      const { canonical, languages } = alternatesFor(locale, path);
      return { url: canonical, lastModified, changeFrequency: "weekly" as const, priority, alternates: { languages } };
    }),
  );
  // Blog: chỉ các ngôn ngữ có bài, hreflang chỉ trỏ tới bản dịch có thật
  const blogIndex = blogLocales.map((locale) => {
    const { canonical, languages } = blogIndexAlternates(locale);
    return { url: canonical, lastModified, changeFrequency: "weekly" as const, priority: 0.6, alternates: { languages } };
  });
  const blogPosts = blogLocales.flatMap((locale) =>
    postsFor(locale).map((post) => {
      const { canonical, languages } = postAlternates(post);
      return { url: canonical, lastModified: new Date(post.updated ?? post.date), changeFrequency: "monthly" as const, priority: 0.6, alternates: { languages } };
    }),
  );
  return [...staticPages, ...blogIndex, ...blogPosts];
}
