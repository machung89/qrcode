import { locales, defaultLocale, type Locale } from "@/i18n/config";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "QR Code Generator";

/** Đường dẫn tuyệt đối cho 1 locale, vd localeUrl("vi", "/scanner"). */
export function localeUrl(locale: Locale, path = "") {
  return `${siteUrl}/${locale}${path}`;
}

/** canonical + hreflang cho mọi ngôn ngữ. */
export function alternatesFor(locale: Locale, path = "") {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = localeUrl(l, path);
  languages["x-default"] = localeUrl(defaultLocale, path);
  return { canonical: localeUrl(locale, path), languages };
}
