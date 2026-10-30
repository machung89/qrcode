import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PricingPlans } from "@/components/PricingPlans";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { listPayments } from "@/lib/billing";
import { usage } from "@/lib/dynamic-qr";
import { planLimits } from "@/lib/plans";
import { requireUser, userPlan } from "@/lib/user-auth";

export async function generateMetadata({ params }: PageProps<"/[locale]/dashboard/billing">): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDictionary(locale).billing.title } : {};
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-500 tabular-nums">
          {used}/{limit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-brand-500"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function BillingPage({ params, searchParams }: PageProps<"/[locale]/dashboard/billing">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const user = await requireUser(locale);
  const dict = getDictionary(locale);
  const t = dict.billing;
  const plan = userPlan(user);
  const limits = planLimits[plan];
  const [used, payments] = await Promise.all([usage(user.id), listPayments(user.id)]);
  const q = await searchParams;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const notice = q.paid
    ? { ok: true, text: t.paid }
    : q.canceled
      ? { ok: false, text: t.canceled }
      : q.error === "checkout"
        ? { ok: false, text: t.errorCheckout }
        : q.error
          ? { ok: false, text: t.errorPayment }
          : null;

  return (
    <>
      <Link href={`/${locale}/dashboard`} className="text-sm text-slate-500 hover:text-brand-600">
        ← {dict.dashboard.back}
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-extrabold sm:text-3xl">{t.title}</h1>

      {notice && (
        <p role="status" className={`mb-6 rounded-lg p-4 text-sm font-medium ${notice.ok ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
          {notice.ok ? "✓ " : ""}
          {notice.text}
          {q.error === "payment" && (
            <>
              {" "}
              <Link href={`/${locale}/dashboard/support?category=billing`} className="underline">
                {dict.support.contact}
              </Link>
            </>
          )}
        </p>
      )}

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <p className="text-xs font-medium text-slate-500">{t.currentPlan}</p>
          <p className="mt-1 text-2xl font-bold">{dict.pricing.planNames[plan]}</p>
          <p className="mt-1 text-sm text-slate-600">
            {plan === "free" ? t.freeForever : t.expires.replace("{date}", date.format(user.plan_expires_at ?? 0))}
          </p>
          <p className="mt-3 text-xs text-slate-500">{t.expiredNote}</p>
        </div>
        <div className="card space-y-4 p-5">
          <p className="text-xs font-medium text-slate-500">{t.usage}</p>
          <UsageBar label={t.codesUsed} used={used.codes} limit={limits.codes} />
          <UsageBar label={t.pdfUsed} used={used.pdfFiles} limit={limits.pdfFiles} />
        </div>
      </div>

      <PricingPlans locale={locale} t={dict.pricing} currentPlan={plan} />

      <h2 className="mt-12 mb-3 text-lg font-bold">{t.history}</h2>
      <div className="card overflow-x-auto">
        {payments.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">{t.noPayments}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs text-slate-500">
              <tr>
                <th className="p-3 font-medium">{t.date}</th>
                <th className="p-3 font-medium">{t.plan}</th>
                <th className="p-3 text-right font-medium">{t.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="p-3">{date.format(p.completed_at ?? p.created_at)}</td>
                  <td className="p-3">
                    {dict.pricing.planNames[p.plan]} · {p.period === "month" ? dict.pricing.monthly : dict.pricing.yearly}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {p.amount} {p.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
