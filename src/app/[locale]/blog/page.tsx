import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/Sections";
import { defaultLocale, isLocale, locales, ogLocales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { blogIndexAlternates, blogLocales, postsFor, readingMinutes } from "@/lib/blog";
import { localeUrl, siteName } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).blog;
  const own = blogLocales.includes(locale);
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: blogIndexAlternates(locale),
    openGraph: { title: t.metaTitle, description: t.metaDescription, url: `/${locale}/blog`, locale: ogLocales[locale] },
    // Ngôn ngữ chưa có bài: trang chỉ liệt kê bài tiếng Anh -> không cho index để tránh nội dung trùng lặp
    robots: own ? undefined : { index: false, follow: true },
  };
}

export default async function BlogIndex({ params }: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.blog;
  const own = blogLocales.includes(locale);
  const postLocale: Locale = own ? locale : defaultLocale;
  const list = postsFor(postLocale);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {own && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Blog",
            name: `${siteName} – ${t.title}`,
            url: localeUrl(locale, "/blog"),
            inLanguage: locale,
            blogPost: list.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: localeUrl(locale, `/blog/${p.slug}`),
              datePublished: p.date,
            })),
          }}
        />
      )}
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{t.title}</h1>
        <p className="mt-3 text-lg text-slate-600">{t.subtitle}</p>
        {!own && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{t.englishOnly}</p>}
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <article key={p.id} className="card flex flex-col p-6 transition hover:border-brand-200 hover:shadow-md">
            <p className="text-xs text-slate-500">
              <time dateTime={p.date}>{date.format(new Date(p.date))}</time> · {t.minRead.replace("{n}", String(readingMinutes(p.body)))}
            </p>
            <h2 className="mt-2 text-lg leading-snug font-bold">
              <Link href={`/${postLocale}/blog/${p.slug}`} className="hover:text-brand-600">
                {p.title}
              </Link>
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{p.description}</p>
            <Link href={`/${postLocale}/blog/${p.slug}`} className="mt-4 text-sm font-semibold text-brand-600 hover:underline" aria-label={`${t.readMore}: ${p.title}`}>
              {t.readMore} <span className="inline-block rtl:-scale-x-100">→</span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
