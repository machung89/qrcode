import { posts } from "@/content/blog";
import { defaultLocale, type Locale } from "@/i18n/config";
import { localeUrl } from "./site";

/** Một bản dịch của bài viết. body viết bằng Markdown rút gọn (xem lib/markdown.tsx). */
export type PostTranslation = {
  slug: string;
  title: string;
  description: string;
  body: string;
};

export type Post = {
  /** Mã chung của bài, giống nhau giữa các bản dịch */
  id: string;
  date: string;
  updated?: string;
  /** Công cụ liên quan để gợi ý cuối bài, vd "/qr/wifi" */
  cta: string;
  translations: Partial<Record<Locale, PostTranslation>>;
};

export type LocalizedPost = PostTranslation & Omit<Post, "translations"> & { locale: Locale };

const byDate = (a: Post, b: Post) => b.date.localeCompare(a.date);

/** Bài viết có bản dịch ở ngôn ngữ này, mới nhất trước */
export function postsFor(locale: Locale): LocalizedPost[] {
  return posts
    .filter((p) => p.translations[locale])
    .sort(byDate)
    .map(({ translations, ...p }) => ({ ...p, ...translations[locale]!, locale }));
}

/** Ngôn ngữ có ít nhất một bài viết */
export const blogLocales = [...new Set(posts.flatMap((p) => Object.keys(p.translations) as Locale[]))];

export function getPost(locale: Locale, slug: string): LocalizedPost | null {
  return postsFor(locale).find((p) => p.slug === slug) ?? null;
}

/** canonical + hreflang chỉ gồm các bản dịch thật sự có (không trỏ tới trang không tồn tại) */
export function postAlternates(post: LocalizedPost) {
  const source = posts.find((p) => p.id === post.id)!;
  const languages: Record<string, string> = {};
  for (const [l, t] of Object.entries(source.translations)) languages[l] = localeUrl(l as Locale, `/blog/${t.slug}`);
  const fallback = source.translations[defaultLocale] ? defaultLocale : post.locale;
  languages["x-default"] = languages[fallback];
  return { canonical: localeUrl(post.locale, `/blog/${post.slug}`), languages };
}

/** hreflang cho trang danh sách blog: chỉ các ngôn ngữ có bài */
export function blogIndexAlternates(locale: Locale) {
  const languages: Record<string, string> = {};
  for (const l of blogLocales) languages[l] = localeUrl(l, "/blog");
  languages["x-default"] = localeUrl(blogLocales.includes(defaultLocale) ? defaultLocale : blogLocales[0], "/blog");
  return { canonical: localeUrl(locale, "/blog"), languages };
}

/** Số phút đọc (~220 từ/phút) */
export function readingMinutes(body: string) {
  return Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 220));
}
