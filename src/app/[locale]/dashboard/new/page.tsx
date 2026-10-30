import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateQrForm } from "@/components/dashboard/CreateQrForm";
import { dynamicTypeNames } from "@/components/dashboard/labels";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { planLimits } from "@/lib/plans";
import { requireUser, userPlan } from "@/lib/user-auth";
import { createQrAction } from "../actions";

export async function generateMetadata({ params }: PageProps<"/[locale]/dashboard/new">): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDictionary(locale).dashboard.newQr } : {};
}

export default async function NewQrPage({ params }: PageProps<"/[locale]/dashboard/new">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const user = await requireUser(locale);
  const dict = getDictionary(locale);
  const t = dict.dashboard;
  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/${locale}/dashboard`} className="text-sm text-slate-500 hover:text-brand-600">
        <span className="inline-block rtl:-scale-x-100">←</span> {t.back}
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-extrabold">{t.newQr}</h1>
      <CreateQrForm
        action={createQrAction.bind(null, locale)}
        t={t}
        fields={dict.fields}
        typeNames={dynamicTypeNames(dict)}
        chooseType={dict.generator.chooseType}
        maxPdfBytes={planLimits[userPlan(user)].pdfBytes}
      />
    </div>
  );
}
