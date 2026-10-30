import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getUser } from "@/lib/user-auth";
import { registerAction } from "../login/actions";

export async function generateMetadata({ params }: PageProps<"/[locale]/register">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).dashboard.registerTitle, robots: { index: false, follow: false } };
}

export default async function RegisterPage({ params }: PageProps<"/[locale]/register">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (await getUser()) redirect(`/${locale}/dashboard`);
  const t = getDictionary(locale).dashboard;

  return (
    <AuthLayout locale={locale} t={t} title={t.registerTitle} footer={{ text: t.haveAccount, link: t.signInLink, href: `/${locale}/login` }}>
      <AuthForm mode="register" locale={locale} t={t} action={registerAction.bind(null, locale)} />
    </AuthLayout>
  );
}
