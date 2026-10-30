import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyLink } from "@/components/dashboard/CopyLink";
import { dynamicTypeNames } from "@/components/dashboard/labels";
import { QrSettings } from "@/components/dashboard/QrSettings";
import { BreakdownList, DailyChart, StatCard } from "@/components/dashboard/Stats";
import { QrGenerator, type SavedDesign } from "@/components/QrGenerator";
import { generatorLabels } from "@/components/Sections";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { contentOf, getQr, getStats, typeOf } from "@/lib/dynamic-qr";
import { siteUrl } from "@/lib/site";
import { planLimits } from "@/lib/plans";
import { getUser, requireUser, userPlan } from "@/lib/user-auth";
import { deleteQrAction, saveDesignAction, setActiveAction, updateQrAction } from "../../actions";

// Trang riêng tư, id bất kỳ -> không dựng sẵn
export const dynamicParams = true;

export async function generateMetadata({ params }: PageProps<"/[locale]/dashboard/qr/[id]">): Promise<Metadata> {
  const { locale, id } = await params;
  const user = await getUser();
  const qr = user ? await getQr(user.id, id) : null;
  return isLocale(locale) && qr ? { title: `${qr.name} – ${getDictionary(locale).dashboard.stats}` } : {};
}

function parseDesign(json: string | null): SavedDesign | null {
  try {
    return json ? (JSON.parse(json) as SavedDesign) : null;
  } catch {
    return null;
  }
}

export default async function QrDetailPage({ params }: PageProps<"/[locale]/dashboard/qr/[id]">) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const user = await requireUser(locale);
  const qr = await getQr(user.id, id);
  // Mã không tồn tại hoặc của người khác -> về danh sách
  if (!qr) redirect(`/${locale}/dashboard`);

  const dict = getDictionary(locale);
  const t = dict.dashboard;
  const limits = planLimits[userPlan(user)];
  const stats = await getStats(qr.id, limits.statsDays);
  const type = typeOf(qr);
  const shortUrl = `${siteUrl}/r/${qr.slug}`;
  const num = new Intl.NumberFormat(locale);
  const dateTime = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const regions = new Intl.DisplayNames([locale], { type: "region" });
  const countryName = (code: string) => {
    try {
      return code.length === 2 ? `${regions.of(code)} (${code})` : "—";
    } catch {
      return code;
    }
  };

  return (
    <>
      <Link href={`/${locale}/dashboard`} className="text-sm text-slate-500 hover:text-brand-600">
        ← {t.back}
      </Link>
      <div className="mt-2 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="min-w-0 truncate text-2xl font-extrabold sm:text-3xl">{qr.name}</h1>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${qr.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
          {qr.active ? t.active : t.paused}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{dynamicTypeNames(dict)[type]}</span>
      </div>

      <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-4">
          <div className="card p-5">
            <p className="label">{t.shortLink}</p>
            <CopyLink url={shortUrl} labels={{ copy: t.copy, copied: t.copied, open: t.open }} />
          </div>

          <h2 className="pt-2 text-lg font-bold">{t.stats}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <StatCard label={t.totalScans} value={num.format(stats.total)} />
            <StatCard label={t.uniqueVisitors} value={num.format(stats.unique_visitors)} />
            <div className="col-span-2 md:col-span-1">
              <StatCard label={t.lastScan} value={stats.last_scan ? dateTime.format(stats.last_scan) : t.never} />
            </div>
          </div>
          <DailyChart data={stats.daily} locale={locale} title={t.scansOverTime.replace("30", String(limits.statsDays))} />
          {limits.breakdowns ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <BreakdownList title={t.byDevice} rows={stats.devices} empty={t.noData} />
              <BreakdownList title={t.byOs} rows={stats.os} empty={t.noData} />
              <BreakdownList title={t.byBrowser} rows={stats.browsers} empty={t.noData} />
              <BreakdownList title={t.byCountry} rows={stats.countries} empty={t.noData} format={countryName} />
            </div>
          ) : (
            // Gói miễn phí: chỉ có tổng lượt quét + biểu đồ 7 ngày
            <div className="card flex flex-wrap items-center gap-4 p-5">
              <p className="flex-1 text-sm text-slate-600">🔒 {dict.billing.statsLocked}</p>
              <Link href={`/${locale}/dashboard/billing`} className="btn-primary">
                {dict.billing.upgrade}
              </Link>
            </div>
          )}
        </div>

        <div className="lg:self-start">
          <QrSettings
            t={t}
            fields={dict.fields}
            qr={{
              name: qr.name,
              type,
              values: type === "url" ? { url: qr.target_url ?? "" } : contentOf(qr),
              fileName: qr.file_name,
              fileUrl: qr.file_id ? `/f/${qr.file_id}` : null,
              active: !!qr.active,
            }}
            update={updateQrAction.bind(null, locale, qr.id)}
            setActive={setActiveAction.bind(null, locale, qr.id)}
            remove={deleteQrAction.bind(null, locale, qr.id)}
            maxPdfBytes={limits.pdfBytes}
          />
        </div>
      </div>

      <h2 className="mb-3 text-lg font-bold">{t.design}</h2>
      <QrGenerator
        labels={generatorLabels(dict)}
        fixedData={shortUrl}
        fileName={`qr-${qr.slug}`}
        initial={parseDesign(qr.design)}
        onSave={saveDesignAction.bind(null, qr.id)}
        saveLabels={{ save: t.saveDesign, saving: t.saving, saved: t.saved }}
      />
    </>
  );
}
