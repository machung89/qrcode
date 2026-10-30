import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { QrType } from "@/lib/qr-types";
import { localeUrl, siteName } from "@/lib/site";
import { AdSlot } from "./ads/AdSlot";
import { QrGenerator } from "./QrGenerator";
import { appJsonLd, Faq, faqJsonLd, Features, generatorLabels, HowTo, JsonLd, TypesGrid } from "./Sections";

type Props = { locale: Locale; dict: Dictionary; type?: QrType };

export function GeneratorPage({ locale, dict, type }: Props) {
  const info = type ? dict.types[type] : null;
  const title = info ? info.title : dict.hero.title;
  const description = info ? info.metaDescription : dict.meta.description;
  const url = localeUrl(locale, type ? `/qr/${type}` : "");

  const jsonLd: unknown[] = [appJsonLd(info ? info.title : siteName, description, url, locale), faqJsonLd(dict)];
  if (info) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: dict.common.home, item: localeUrl(locale) },
        { "@type": "ListItem", position: 2, name: info.title, item: url },
      ],
    });
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="bg-gradient-to-b from-brand-50 to-transparent">
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-6 text-center sm:pt-12">
          {info && (
            <nav aria-label="Breadcrumb" className="mb-3 text-sm text-slate-500">
              <Link href={`/${locale}`} className="hover:text-brand-600">
                {dict.common.home}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-slate-700">{info.name}</span>
            </nav>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">{info ? info.intro : dict.hero.subtitle}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <QrGenerator
          key={type ?? "home"}
          initialType={type ?? "url"}
          labels={generatorLabels(dict)}
          aside={<AdSlot placement="sidebar" label={dict.ads.label} />}
        />
        <AdSlot placement="below_generator" label={dict.ads.label} />

        <section className="mt-8 flex flex-col items-start gap-4 rounded-2xl bg-linear-to-r from-brand-600 to-brand-700 p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div className="flex-1">
            <h2 className="text-xl font-bold">{dict.dashboard.ctaTitle}</h2>
            <p className="mt-1 text-sm text-brand-100">{dict.dashboard.ctaText}</p>
          </div>
          <Link href={`/${locale}/dashboard`} className="shrink-0 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            {dict.dashboard.ctaButton} <span className="inline-block rtl:-scale-x-100">→</span>
          </Link>
        </section>

        <div className="mt-16 space-y-16">
          <HowTo dict={dict} />
          <TypesGrid locale={locale} dict={dict} current={type} />
          <AdSlot placement="in_content" label={dict.ads.label} />
          <Features dict={dict} />
          <Faq dict={dict} />
        </div>
      </div>
    </>
  );
}
