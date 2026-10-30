import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { alternatesFor } from "@/lib/site";

type Kind = "privacy" | "terms";

export function legalMetadata(locale: string, kind: Kind): Metadata {
  if (!isLocale(locale)) return {};
  const content = getDictionary(locale)[kind];
  return { title: content.title, description: content.metaDescription, alternates: alternatesFor(locale, `/${kind}`) };
}

export function LegalPage({ locale, kind }: { locale: Locale; kind: Kind }) {
  const { title, sections } = getDictionary(locale)[kind];
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-extrabold sm:text-4xl">{title}</h1>
      <div className="card space-y-6 p-6 sm:p-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-2 text-lg font-semibold">{s.h}</h2>
            <p className="leading-relaxed text-slate-600">{s.p}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
