import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getUser } from "@/lib/user-auth";

export async function generateMetadata({ params }: PageProps<"/[locale]/register">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).dashboard.registerTitle, robots: { index: false, follow: false } };
}

/** Đăng ký = đăng nhập Google lần đầu; trang này chỉ khác tiêu đề để rõ ràng với người dùng mới. */
export default async function RegisterPage({ params }: PageProps<"/[locale]/register">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (await getUser()) redirect(`/${locale}/dashboard`);
  const t = getDictionary(locale).dashboard;

  return <AuthLayout locale={locale} t={t} title={t.registerTitle} footer={{ text: t.haveAccount, link: t.signInLink, href: `/${locale}/login` }} />;
}
