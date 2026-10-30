import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getUser } from "@/lib/user-auth";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).dashboard.loginTitle, robots: { index: false, follow: false } };
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (await getUser()) redirect(`/${locale}/dashboard`);
  const t = getDictionary(locale).dashboard;
  const { error } = await searchParams;

  return (
    <AuthLayout
      locale={locale}
      t={t}
      title={t.loginTitle}
      notice={error === "config" ? t.notConfigured : error ? t.loginError : undefined}
      footer={{ text: t.noAccount, link: t.signUpLink, href: `/${locale}/register` }}
    />
  );
}
