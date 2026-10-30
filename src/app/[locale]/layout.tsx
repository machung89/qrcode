import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { AdScripts } from "@/components/ads/AdScripts";
import { AdSlot, StickyAd } from "@/components/ads/AdSlot";
import { AdsProvider } from "@/components/ads/AdsProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { isLocale, locales, ogLocales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { siteMetaTags } from "@/lib/ads/meta";
import { alternatesFor, siteName, siteUrl } from "@/lib/site";
import "../globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext", "vietnamese"], variable: "--font-inter", display: "swap" });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// URL không có trong danh sách -> 404 toàn cục (app/not-found.tsx)
export const dynamicParams = false;

export const viewport: Viewport = { themeColor: "#2753e6", width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: dict.meta.title, template: `%s | ${siteName}` },
    description: dict.meta.description,
    applicationName: siteName,
    alternates: alternatesFor(locale),
    openGraph: {
      type: "website",
      siteName,
      locale: ogLocales[locale],
      title: dict.meta.title,
      description: dict.meta.description,
      url: `/${locale}`,
    },
    twitter: { card: "summary_large_image", title: dict.meta.title, description: dict.meta.description },
    robots: { index: true, follow: true },
    other: siteMetaTags(),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <AdsProvider locale={locale}>
          <Header locale={locale} dict={dict} />
          <AdSlot placement="header_banner" label={dict.ads.label} className="px-4" />
          <main>{children}</main>
          <AdSlot placement="footer_banner" label={dict.ads.label} className="px-4" />
          <Footer locale={locale} dict={dict} />
          <StickyAd label={dict.ads.label} closeLabel={dict.ads.close} />
          <AdScripts />
        </AdsProvider>
      </body>
    </html>
  );
}
