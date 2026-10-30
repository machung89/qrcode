import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { QrScanner } from "@/components/QrScanner";
import { appJsonLd, Faq, JsonLd, TypesGrid } from "@/components/Sections";
import { isLocale, ogLocales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { alternatesFor, localeUrl } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/scanner">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const s = getDictionary(locale).scanner;
  return {
    title: s.title,
    description: s.metaDescription,
    alternates: alternatesFor(locale, "/scanner"),
    openGraph: { title: s.title, description: s.metaDescription, url: `/${locale}/scanner`, locale: ogLocales[locale] },
  };
}

export default async function ScannerPage({ params }: PageProps<"/[locale]/scanner">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const s = dict.scanner;

  return (
    <>
      <JsonLd data={appJsonLd(s.title, s.metaDescription, localeUrl(locale, "/scanner"), locale)} />
      <section className="bg-gradient-to-b from-brand-50 to-transparent">
        <div className="mx-auto max-w-4xl px-4 pt-8 pb-6 text-center sm:pt-12">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">{s.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 sm:text-lg">{s.intro}</p>
        </div>
      </section>
      <div className="mx-auto max-w-4xl px-4">
        <QrScanner labels={s} />
        <AdSlot placement="below_generator" label={dict.ads.label} />
      </div>
      <div className="mx-auto mt-16 max-w-6xl space-y-16 px-4">
        <TypesGrid locale={locale} dict={dict} />
        <AdSlot placement="in_content" label={dict.ads.label} />
        <Faq dict={dict} />
      </div>
    </>
  );
}
