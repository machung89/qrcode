"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALE_COOKIE, localeNames, locales, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function change(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    const rest = pathname.split("/").slice(2).join("/");
    router.push(`/${next}${rest ? `/${rest}` : ""}${window.location.search}`);
  }

  return (
    // Hiển thị mã ngôn ngữ trên mobile, tên đầy đủ từ sm trở lên; select trong suốt phủ lên trên
    <label className="relative inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 focus-within:border-brand-500 hover:border-slate-400">
      <span className="sr-only">{label}</span>
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
      <span className="sm:hidden" aria-hidden="true">
        {locale.toUpperCase()}
      </span>
      <span className="hidden sm:inline" aria-hidden="true">
        {localeNames[locale]}
      </span>
      <select
        value={locale}
        onChange={(e) => change(e.target.value as Locale)}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {l.toUpperCase()} {localeNames[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
