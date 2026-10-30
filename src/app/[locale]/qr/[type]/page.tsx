import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GeneratorPage } from "@/components/GeneratorPage";
import { isLocale, locales, ogLocales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { isQrType, qrTypes } from "@/lib/qr-types";
import { alternatesFor } from "@/lib/site";

// URL không có trong danh sách -> 404 toàn cục (app/not-found.tsx)
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => qrTypes.map((type) => ({ locale, type })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/qr/[type]">): Promise<Metadata> {
  const { locale, type } = await params;
  if (!isLocale(locale) || !isQrType(type)) return {};
  const info = getDictionary(locale).types[type];
  const path = `/qr/${type}`;
  return {
    title: info.title,
    description: info.metaDescription,
    alternates: alternatesFor(locale, path),
    openGraph: { title: info.title, description: info.metaDescription, url: `/${locale}${path}`, locale: ogLocales[locale] },
  };
}

export default async function TypePage({ params }: PageProps<"/[locale]/qr/[type]">) {
  const { locale, type } = await params;
  if (!isLocale(locale) || !isQrType(type)) notFound();
  return <GeneratorPage locale={locale} dict={getDictionary(locale)} type={type} />;
}
