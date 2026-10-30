"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

type Texts = Record<string, { title: string; text: string; back: string }>;

export function NotFoundContent({ texts }: { texts: Texts }) {
  // Trang 404 là HTML tĩnh (tiếng Anh); chỉ đổi ngôn ngữ sau khi hydrate để tránh lệch nội dung
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  useEffect(() => {
    const first = window.location.pathname.split("/")[1];
    if (isLocale(first)) setLocale(first);
  }, []);
  const t = texts[locale];
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold">{t.title}</h1>
      <p className="mt-2 text-slate-600">{t.text}</p>
      <Link href={`/${locale}`} className="btn-primary mt-8">
        {t.back}
      </Link>
    </div>
  );
}
