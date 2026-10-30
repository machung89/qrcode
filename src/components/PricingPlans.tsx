"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { paidPlans, planLimits, plans, type PaidPlan, type Period, type Plan } from "@/lib/plans";

type Prices = { enabled: boolean; currency: string; prices: Record<PaidPlan, Record<Period, number>> };

type Props = {
  locale: string;
  t: Dictionary["pricing"];
  /** Gói hiện tại của người dùng (trang Gói & thanh toán); trang công khai thì bỏ trống */
  currentPlan?: Plan;
};

const fill = (text: string, vars: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

export function PricingPlans({ locale, t, currentPlan }: Props) {
  const [period, setPeriod] = useState<Period>("year");
  const [data, setData] = useState<Prices | null>(null);

  useEffect(() => {
    fetch("/api/billing/plans")
      .then((r) => r.json() as Promise<Prices>)
      .then(setData)
      .catch(() => setData({ enabled: false, currency: "USD", prices: { personal: { month: 0, year: 0 }, business: { month: 0, year: 0 } } }));
  }, []);

  const money = (value: number) =>
    data ? new Intl.NumberFormat(locale, { style: "currency", currency: data.currency, maximumFractionDigits: data.currency === "JPY" ? 0 : 2 }).format(value) : "";
  const savePct = data
    ? Math.max(...paidPlans.map((p) => Math.round((1 - data.prices[p].year / (data.prices[p].month * 12)) * 100)))
    : 0;

  const features = (plan: Plan) => {
    const l = planLimits[plan];
    return [
      t.features.staticUnlimited,
      fill(t.features.codes, { n: l.codes }),
      fill(t.features.pdf, { n: l.pdfFiles, mb: Math.round(l.pdfBytes / 1048576) }),
      l.breakdowns ? t.features.statsFull : t.features.stats7,
      t.features.unlimitedScans,
      l.noAds ? t.features.noAds : t.features.ads,
      t.features.keepWorking,
    ];
  };

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1" role="radiogroup">
          {(["month", "year"] as const).map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={period === p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${period === p ? "bg-brand-600 text-white" : "text-slate-600 hover:text-slate-900"}`}
            >
              {p === "month" ? t.monthly : t.yearly}
              {p === "year" && savePct > 0 && (
                <span className={`ms-2 rounded-full px-2 py-0.5 text-xs ${period === p ? "bg-white/20" : "bg-green-100 text-green-700"}`}>
                  {fill(t.save, { n: savePct })}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const paid = plan !== "free";
          const popular = plan === "personal";
          const isCurrent = currentPlan === plan;
          return (
            <div key={plan} className={`card relative flex flex-col p-6 ${popular ? "border-brand-500 ring-2 ring-brand-500" : ""}`}>
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">{t.popular}</span>
              )}
              <h3 className="text-lg font-bold">{t.planNames[plan]}</h3>
              <p className="text-sm text-slate-500">{t.planDesc[plan]}</p>
              <p className="mt-4 mb-5 min-h-12">
                {!paid ? (
                  <bdi dir="ltr" className="text-4xl font-extrabold">{data ? money(0) : "…"}</bdi>
                ) : data ? (
                  <>
                    <bdi dir="ltr" className="text-4xl font-extrabold">{money(data.prices[plan][period])}</bdi>
                    <span className="text-slate-500">{period === "month" ? t.perMonth : t.perYear}</span>
                  </>
                ) : (
                  <span className="text-sm text-slate-400">{t.loading}</span>
                )}
              </p>
              <ul className="mb-6 flex-1 space-y-2 text-sm text-slate-700">
                {features(plan).map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-brand-600">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {!paid ? (
                isCurrent ? (
                  <span className="btn-ghost w-full cursor-default">{t.current}</span>
                ) : (
                  <Link href={`/${locale}/dashboard`} className="btn-ghost w-full py-3">
                    {t.startFree}
                  </Link>
                )
              ) : data && !data.enabled ? (
                <p className="rounded-lg bg-slate-50 p-3 text-center text-sm text-slate-500">{t.unavailable}</p>
              ) : (
                <form action="/api/paypal/checkout" method="post">
                  <input type="hidden" name="plan" value={plan} />
                  <input type="hidden" name="period" value={period} />
                  <input type="hidden" name="locale" value={locale} />
                  <button type="submit" className={`${popular ? "btn-primary" : "btn-ghost"} w-full py-3`} disabled={!data}>
                    {isCurrent ? t.extend : t.buy}
                  </button>
                  {isCurrent && <p className="mt-2 text-center text-xs font-medium text-brand-700">✓ {t.current}</p>}
                </form>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">{t.oneTime}</p>
    </div>
  );
}
