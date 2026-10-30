import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { qrTypes, type QrType } from "@/lib/qr-types";
import type { GeneratorLabels } from "./QrGenerator";
import { TypeIcon } from "./TypeIcon";

export function generatorLabels(dict: Dictionary): GeneratorLabels {
  const types = Object.fromEntries(qrTypes.map((t) => [t, { name: dict.types[t].name, short: dict.types[t].short }]));
  return { generator: dict.generator, fields: dict.fields, types: types as GeneratorLabels["types"] };
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function TypesGrid({ locale, dict, current }: { locale: Locale; dict: Dictionary; current?: QrType }) {
  return (
    <section id="types" className="scroll-mt-20">
      <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">{dict.common.allTypes}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {qrTypes.map((t) => (
          <Link
            key={t}
            href={`/${locale}/qr/${t}`}
            aria-current={t === current ? "page" : undefined}
            className={`card group flex flex-col gap-2 p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md ${
              t === current ? "border-brand-500 ring-1 ring-brand-500" : ""
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white">
              <TypeIcon type={t} />
            </span>
            <span className="font-semibold">{dict.types[t].title}</span>
            <span className="text-sm text-slate-500">{dict.types[t].short}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HowTo({ dict }: { dict: Dictionary }) {
  return (
    <section>
      <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">{dict.howto.title}</h2>
      <ol className="grid gap-4 md:grid-cols-3">
        {dict.howto.steps.map((s, i) => (
          <li key={s.t} className="card p-6">
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{i + 1}</span>
            <h3 className="mb-1 font-semibold">{s.t}</h3>
            <p className="text-sm text-slate-600">{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Features({ dict }: { dict: Dictionary }) {
  return (
    <section>
      <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">{dict.features.title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dict.features.items.map((f) => (
          <div key={f.t} className="card p-6">
            <h3 className="mb-1 flex items-center gap-2 font-semibold">
              <span className="text-brand-600">✓</span> {f.t}
            </h3>
            <p className="text-sm text-slate-600">{f.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Faq({ dict }: { dict: Dictionary }) {
  return (
    <section>
      <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">{dict.faq.title}</h2>
      <div className="mx-auto max-w-3xl space-y-3">
        {dict.faq.items.map((item) => (
          <details key={item.q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              {item.q}
              <span className="text-xl text-slate-400 transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function faqJsonLd(dict: Dictionary) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.faq.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function appJsonLd(name: string, description: string, url: string, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url,
    inLanguage: locale,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}
