import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { JsonLd } from "@/components/Sections";
import { isLocale, ogLocales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { blogLocales, getPost, postAlternates, postsFor, readingMinutes } from "@/lib/blog";
import { headings, Markdown } from "@/lib/markdown";
import { localeUrl, siteName, siteUrl } from "@/lib/site";

// Chỉ dựng các bài có bản dịch; URL khác -> 404
export const dynamicParams = false;

export function generateStaticParams() {
  return blogLocales.flatMap((locale) => postsFor(locale).map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = isLocale(locale) ? getPost(locale, slug) : null;
  if (!post) return {};
  return {
    // Tiêu đề bài đã đủ dài và chứa từ khoá: bỏ hậu tố "| Tên website" để Google không cắt ngắn
    title: { absolute: post.title },
    description: post.description,
    alternates: postAlternates(post),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/${locale}/blog/${post.slug}`,
      locale: ogLocales[post.locale],
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
    },
    twitter: { card: "summary", title: post.title, description: post.description },
  };
}

export default async function BlogPost({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const post = getPost(locale, slug);
  if (!post) notFound();
  const dict = getDictionary(locale);
  const t = dict.blog;
  const toc = headings(post.body);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
  const related = postsFor(locale)
    .filter((p) => p.id !== post.id)
    .slice(0, 3);
  const url = localeUrl(locale, `/blog/${post.slug}`);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            dateModified: post.updated ?? post.date,
            inLanguage: locale,
            mainEntityOfPage: url,
            url,
            wordCount: post.body.split(/\s+/).filter(Boolean).length,
            author: { "@type": "Organization", name: siteName, url: siteUrl },
            publisher: { "@type": "Organization", name: siteName, url: siteUrl, logo: { "@type": "ImageObject", url: `${siteUrl}/icon.svg` } },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: dict.common.home, item: localeUrl(locale) },
              { "@type": "ListItem", position: 2, name: t.title, item: localeUrl(locale, "/blog") },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          },
        ]}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href={`/${locale}`} className="hover:text-brand-600">
              {dict.common.home}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/${locale}/blog`} className="hover:text-brand-600">
              {t.title}
            </Link>
          </li>
        </ol>
      </nav>

      <header className="mt-4 mb-8">
        <h1 className="text-3xl leading-tight font-extrabold sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-slate-500">
          {t.published} <time dateTime={post.date}>{date.format(new Date(post.date))}</time>
          {post.updated && (
            <>
              {" "}
              · {t.updated} <time dateTime={post.updated}>{date.format(new Date(post.updated))}</time>
            </>
          )}{" "}
          · {t.minRead.replace("{n}", String(readingMinutes(post.body)))}
        </p>
        <p className="mt-4 text-lg leading-relaxed text-slate-700">{post.description}</p>
      </header>

      {toc.length >= 3 && (
        <nav aria-labelledby="toc-title" className="card mb-8 p-5">
          <p id="toc-title" className="mb-2 text-sm font-semibold text-slate-900">
            {t.toc}
          </p>
          <ol className="list-decimal space-y-1 ps-5 text-sm">
            {toc.map((h) => (
              <li key={h.id}>
                <a href={`#${h.id}`} className="text-brand-700 hover:underline">
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="prose-blog">
        <Markdown source={post.body} />
      </div>

      <AdSlot placement="in_content" label={dict.ads.label} />

      <aside className="mt-10 rounded-2xl bg-brand-600 p-6 text-white sm:p-8">
        <p className="text-xl font-bold">{t.ctaTitle}</p>
        <p className="mt-2 text-brand-100">{t.ctaText}</p>
        <Link href={`/${locale}${post.cta}`} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-semibold text-brand-700 hover:bg-brand-50">
          {t.ctaButton} <span className="inline-block rtl:-scale-x-100">→</span>
        </Link>
      </aside>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">{t.related}</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {related.map((p) => (
              <li key={p.id} className="card p-4 transition hover:border-brand-200">
                <Link href={`/${locale}/blog/${p.slug}`} className="text-sm leading-snug font-semibold hover:text-brand-600">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
