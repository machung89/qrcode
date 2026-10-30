import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { requireUser } from "@/lib/user-auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({ children, params }: LayoutProps<"/[locale]/dashboard">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  await requireUser(locale);
  return <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>;
}
