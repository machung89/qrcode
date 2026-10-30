import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateQrForm } from "@/components/dashboard/CreateQrForm";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { requireUser } from "@/lib/user-auth";
import { createQrAction } from "../actions";

export async function generateMetadata({ params }: PageProps<"/[locale]/dashboard/new">): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDictionary(locale).dashboard.newQr } : {};
}

export default async function NewQrPage({ params }: PageProps<"/[locale]/dashboard/new">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  await requireUser(locale);
  const t = getDictionary(locale).dashboard;
  return (
    <div className="mx-auto max-w-xl">
      <Link href={`/${locale}/dashboard`} className="text-sm text-slate-500 hover:text-brand-600">
        ← {t.back}
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-extrabold">{t.newQr}</h1>
      <CreateQrForm action={createQrAction.bind(null, locale)} t={t} />
    </div>
  );
}
