import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PricingPlans } from "@/components/PricingPlans";
import { Faq } from "@/components/Sections";
import { isLocale, ogLocales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { alternatesFor } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).pricing;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: alternatesFor(locale, "/pricing"),
    openGraph: { title: t.metaTitle, description: t.metaDescription, url: `/${locale}/pricing`, locale: ogLocales[locale] },
  };
}

/** Trang tĩnh; giá lấy qua /api/billing/plans nên admin đổi giá là có hiệu lực ngay. */
export default async function PricingPage({ params }: PageProps<"/[locale]/pricing">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pricing;
  return (
    <>
      <section className="bg-linear-to-b from-brand-50 to-transparent">
        <div className="mx-auto max-w-3xl px-4 pt-10 pb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">{t.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 sm:text-lg">{t.subtitle}</p>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-4">
        <PricingPlans locale={locale} t={t} />
      </div>
      <div className="mx-auto mt-16 max-w-6xl px-4">
        <Faq dict={dict} />
      </div>
    </>
  );
}
