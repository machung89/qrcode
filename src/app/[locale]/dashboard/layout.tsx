import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoAds } from "@/components/ads/AdsProvider";
import { isLocale } from "@/i18n/config";
import { planLimits } from "@/lib/plans";
import { requireUser, userPlan } from "@/lib/user-auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({ children, params }: LayoutProps<"/[locale]/dashboard">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const user = await requireUser(locale);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Gói trả phí: không hiện quảng cáo trong dashboard */}
      {planLimits[userPlan(user)].noAds && <NoAds />}
      {children}
    </div>
  );
}
