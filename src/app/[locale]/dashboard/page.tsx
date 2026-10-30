import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PdfIcon } from "@/components/dashboard/CreateQrForm";
import { dynamicTypeNames } from "@/components/dashboard/labels";
import { StatCard } from "@/components/dashboard/Stats";
import { TypeIcon } from "@/components/TypeIcon";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { contentOf, listQrs, typeOf, userTotals } from "@/lib/dynamic-qr";
import { summarize } from "@/lib/dynamic-types";
import { siteUrl } from "@/lib/site";
import { planLimits } from "@/lib/plans";
import { unreadTickets } from "@/lib/support";
import { requireUser, userPlan } from "@/lib/user-auth";

export async function generateMetadata({ params }: PageProps<"/[locale]/dashboard">): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDictionary(locale).dashboard.title } : {};
}

export default async function DashboardPage({ params }: PageProps<"/[locale]/dashboard">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const user = await requireUser(locale);
  const dict = getDictionary(locale);
  const t = dict.dashboard;
  const typeNames = dynamicTypeNames(dict);
  const [codes, totals, unread] = await Promise.all([listQrs(user.id), userTotals(user.id), unreadTickets(user.id)]);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const num = new Intl.NumberFormat(locale);
  const plan = userPlan(user);
  const limit = planLimits[plan].codes;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold sm:text-3xl">{t.title}</h1>
          <p className="text-sm text-slate-500">
            {user.email} · {dict.pricing.planNames[plan]}
          </p>
        </div>
        <Link href={`/${locale}/dashboard/support`} className="btn-ghost relative">
          {dict.support.title}
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white" aria-label={dict.support.newReply}>
              {unread}
            </span>
          )}
        </Link>
        <Link href={`/${locale}/dashboard/billing`} className="btn-ghost">
          {dict.billing.title}
        </Link>
        <Link href={`/${locale}/dashboard/new`} className="btn-primary">
          + {t.newQr}
        </Link>
      </div>

      {codes.length >= limit && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <span className="flex-1">{t.errors.limit}</span>
          <Link href={`/${locale}/dashboard/billing`} className="btn-primary">
            {dict.billing.upgrade}
          </Link>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={t.totalCodes} value={`${num.format(codes.length)}/${num.format(limit)}`} />
        <StatCard label={t.totalScans} value={num.format(totals.total)} />
        <StatCard label={t.scansToday} value={num.format(totals.today ?? 0)} />
        <StatCard label={t.scans30} value={num.format(totals.last30 ?? 0)} />
      </div>

      {codes.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-semibold">{t.empty}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{t.emptyHint}</p>
          <Link href={`/${locale}/dashboard/new`} className="btn-primary mt-6">
            + {t.newQr}
          </Link>
        </div>
      ) : (
        <ul className="card divide-y divide-slate-100">
          {codes.map((qr) => {
            const type = typeOf(qr);
            return (
            <li key={qr.id}>
              <Link href={`/${locale}/dashboard/qr/${qr.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 transition hover:bg-slate-50">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    type === "pdf" ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-600"
                  }`}
                  title={typeNames[type]}
                >
                  {type === "pdf" ? <PdfIcon className="h-5 w-5" /> : <TypeIcon type={type} className="h-5 w-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{qr.name}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {typeNames[type]} · {siteUrl.replace(/^https?:\/\//, "")}/r/{qr.slug} →{" "}
                    {summarize(type, contentOf(qr), { url: qr.target_url, fileName: qr.file_name })}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-bold tabular-nums">{num.format(qr.scans)}</span>
                  <span className="block text-xs text-slate-500">{t.scansCount}</span>
                </span>
                <span className="hidden w-28 text-right text-xs text-slate-500 sm:block">{date.format(qr.created_at)}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${qr.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}
                >
                  {qr.active ? t.active : t.paused}
                </span>
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
