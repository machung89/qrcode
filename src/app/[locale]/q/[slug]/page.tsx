import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { NoAds } from "@/components/ads/AdsProvider";
import { CopyButton } from "@/components/CopyButton";
import { TypeIcon } from "@/components/TypeIcon";
import { isLocale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { contentOf, findBySlug, typeOf } from "@/lib/dynamic-qr";
import { effectivePlan, planLimits } from "@/lib/plans";
import { buildQrData, googleCalendarUrl, type FieldValues, type QrType } from "@/lib/qr-types";

// Trang hiển thị nội dung mã QR động (văn bản, WiFi, vCard...). Không cho Google index.
export const dynamicParams = true;

export async function generateMetadata({ params }: PageProps<"/[locale]/q/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const qr = await findBySlug(slug);
  return { title: qr?.active ? qr.name : undefined, robots: { index: false, follow: false } };
}

const digits = (s = "") => s.replace(/[^\d+]/g, "");

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</dt>
      <dd className="mt-0.5 break-words text-slate-900">{children}</dd>
    </div>
  );
}

const linkCls = "font-medium text-brand-600 hover:underline";
const primaryCls = "btn-primary w-full py-3 text-base";

/** Nội dung + nút hành động theo từng loại mã. */
function Body({ type, c, slug, dict, locale }: { type: QrType; c: FieldValues; slug: string; dict: Dictionary; locale: string }) {
  const f = dict.fields;
  const l = dict.landing;
  switch (type) {
    case "text":
      return (
        <>
          <p className="rounded-xl bg-slate-50 p-4 break-words whitespace-pre-wrap text-slate-900">{c.text}</p>
          <CopyButton value={c.text ?? ""} label={l.copy} copied={l.copied} className="btn-primary w-full py-3" />
        </>
      );
    case "email":
      return (
        <>
          <dl>
            <Row label={f.email}>{c.email}</Row>
            {c.subject && <Row label={f.subject}>{c.subject}</Row>}
            {c.body && (
              <Row label={f.message}>
                <span className="whitespace-pre-wrap">{c.body}</span>
              </Row>
            )}
          </dl>
          <a href={buildQrData("email", c)} className={primaryCls}>
            {l.sendEmail}
          </a>
        </>
      );
    case "phone":
      return (
        <>
          <p className="text-center text-3xl font-bold tracking-wide text-slate-900">{c.phone}</p>
          <a href={`tel:${digits(c.phone)}`} className={primaryCls}>
            {l.call}
          </a>
        </>
      );
    case "sms":
      return (
        <>
          <dl>
            <Row label={f.phone}>{c.phone}</Row>
            {c.message && (
              <Row label={f.message}>
                <span className="whitespace-pre-wrap">{c.message}</span>
              </Row>
            )}
          </dl>
          {/* "?&body=" hoạt động trên cả iOS và Android */}
          <a href={`sms:${digits(c.phone)}${c.message ? `?&body=${encodeURIComponent(c.message)}` : ""}`} className={primaryCls}>
            {l.sendSms}
          </a>
        </>
      );
    case "wifi": {
      const open = c.encryption === "nopass";
      return (
        <>
          <dl>
            <Row label={f.ssid}>
              <span className="text-lg font-semibold">{c.ssid}</span>
            </Row>
            <Row label={f.password}>{open ? f.none : <span className="font-mono text-lg">{c.password}</span>}</Row>
            <Row label={f.encryption}>{open ? f.none : c.encryption === "WEP" ? "WEP" : "WPA/WPA2/WPA3"}</Row>
            {c.hidden === "true" && <Row label={f.hidden}>✓</Row>}
          </dl>
          {!open && c.password && <CopyButton value={c.password} label={l.copyPassword} copied={l.copied} className="btn-primary w-full py-3" />}
          <p className="text-center text-sm text-slate-500">{l.wifiHint}</p>
        </>
      );
    }
    case "vcard": {
      const fullName = [c.firstName, c.lastName].filter(Boolean).join(" ");
      const address = [c.street, c.city, c.zip, c.country].filter(Boolean).join(", ");
      return (
        <>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{fullName}</p>
            {(c.jobTitle || c.organization) && <p className="text-slate-600">{[c.jobTitle, c.organization].filter(Boolean).join(" · ")}</p>}
          </div>
          <dl>
            {c.mobile && (
              <Row label={f.mobile}>
                <a href={`tel:${digits(c.mobile)}`} className={linkCls}>
                  {c.mobile}
                </a>
              </Row>
            )}
            {c.workPhone && (
              <Row label={f.workPhone}>
                <a href={`tel:${digits(c.workPhone)}`} className={linkCls}>
                  {c.workPhone}
                </a>
              </Row>
            )}
            {c.email && (
              <Row label={f.email}>
                <a href={`mailto:${c.email}`} className={linkCls}>
                  {c.email}
                </a>
              </Row>
            )}
            {c.website && (
              <Row label={f.website}>
                <a href={c.website} target="_blank" rel="noopener nofollow" className={linkCls}>
                  {c.website.replace(/^https?:\/\//, "")}
                </a>
              </Row>
            )}
            {address && <Row label={f.street}>{address}</Row>}
            {c.note && (
              <Row label={f.note}>
                <span className="whitespace-pre-wrap">{c.note}</span>
              </Row>
            )}
          </dl>
          <a href={`/r/${slug}/contact.vcf`} className={primaryCls}>
            {l.saveContact}
          </a>
        </>
      );
    }
    case "event": {
      // Giờ lưu dạng "giờ địa phương" không múi giờ: hiển thị nguyên giờ đã nhập
      const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short", timeZone: "UTC" });
      const show = (v?: string) => (v ? fmt.format(new Date(`${v.slice(0, 16)}:00Z`)) : "");
      return (
        <>
          <p className="text-center text-2xl font-bold text-slate-900">{c.title}</p>
          <dl>
            <Row label={f.start}>{show(c.start)}</Row>
            {c.end && <Row label={f.end}>{show(c.end)}</Row>}
            {c.location && <Row label={f.location}>{c.location}</Row>}
            {c.description && (
              <Row label={f.description}>
                <span className="whitespace-pre-wrap">{c.description}</span>
              </Row>
            )}
          </dl>
          <a href={googleCalendarUrl(c)} target="_blank" rel="noopener" className={primaryCls}>
            {l.addToGoogle}
          </a>
          <a href={`/r/${slug}/event.ics`} className="btn-ghost w-full py-3">
            {l.downloadIcs}
          </a>
        </>
      );
    }
    default:
      return null;
  }
}

export default async function DynamicLandingPage({ params }: PageProps<"/[locale]/q/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const qr = await findBySlug(slug);
  const type = qr ? typeOf(qr) : null;
  const content = qr ? contentOf(qr) : null;
  const ok = qr && qr.active && content && type && type !== "url" && type !== "pdf";
  const message = !qr || !content ? dict.dashboard.scanPage.missing : !qr.active ? dict.dashboard.scanPage.paused : null;

  // Chủ mã dùng gói trả phí: trang hiển thị không có quảng cáo
  const noAds = !!qr && planLimits[effectivePlan(qr.owner_plan, qr.owner_plan_expires_at)].noAds;

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      {noAds && <NoAds />}
      <div className="card space-y-5 p-6">
        {ok ? (
          <>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <TypeIcon type={type} className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{dict.types[type].name}</p>
                <h1 className="truncate text-lg font-bold">{qr.name}</h1>
              </div>
            </div>
            <Body type={type} c={content} slug={qr.slug} dict={dict} locale={locale} />
          </>
        ) : (
          <div className="py-6 text-center">
            <h1 className="text-xl font-bold">{(message ?? dict.dashboard.scanPage.missing).title}</h1>
            <p className="mt-2 text-slate-600">{(message ?? dict.dashboard.scanPage.missing).text}</p>
          </div>
        )}
      </div>
      <AdSlot placement="in_content" label={dict.ads.label} />
      <p className="mt-6 text-center">
        <Link href={`/${locale}`} className="text-sm font-semibold text-brand-600 hover:underline">
          {dict.landing.createOwn} →
        </Link>
      </p>
    </div>
  );
}
