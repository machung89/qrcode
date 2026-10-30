"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AdminPayment, AdminUser, BillingConfig } from "@/lib/billing";
import { paidPlans, periods } from "@/lib/plans";
import { saveBillingAction, setUserPlanAction } from "./actions";

type Props = {
  /** Cấu hình hiện tại, không kèm Client Secret */
  config: Omit<BillingConfig, "clientSecret">;
  hasSecret: boolean;
  payments: AdminPayment[];
  users: AdminUser[];
  revenue: { currency: string; total: number; n: number }[];
};

const planName: Record<string, string> = { free: "Miễn phí", personal: "Cá nhân", business: "Doanh nghiệp" };
const periodName: Record<string, string> = { month: "Tháng", year: "Năm" };
const statusStyle: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  created: "bg-slate-100 text-slate-600",
  failed: "bg-red-100 text-red-700",
};
const statusName: Record<string, string> = { completed: "Đã thanh toán", created: "Chưa hoàn tất", failed: "Thất bại" };
const fmtDate = (ms: number | null) => (ms ? new Date(ms).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—");

export function BillingAdmin({ config, hasSecret: initialHasSecret, payments, users, revenue }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ ...config, clientSecret: "" });
  const [hasSecret, setHasSecret] = useState(initialHasSecret);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [planForm, setPlanForm] = useState({ email: "", plan: "personal", expires: "" });
  const [planMsg, setPlanMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const setPrice = (plan: string, period: string, value: string) =>
    setForm((f) => ({ ...f, prices: { ...f.prices, [plan]: { ...f.prices[plan as keyof typeof f.prices], [period]: Number(value) } } }));

  function save() {
    startTransition(async () => {
      const res = await saveBillingAction(form);
      if (res.ok) {
        setHasSecret(!!res.hasSecret);
        setForm((f) => ({ ...f, clientSecret: "" }));
      }
      setMsg({ ok: res.ok, text: res.ok ? "Đã lưu cấu hình thanh toán." : (res.error ?? "Lỗi") });
    });
  }

  function changePlan(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await setUserPlanAction(planForm.email, planForm.plan, planForm.plan === "free" ? "" : planForm.expires);
      setPlanMsg({ ok: res.ok, text: res.ok ? `Đã đổi gói cho ${planForm.email}.` : (res.error ?? "Lỗi") });
      if (res.ok) router.refresh();
    });
  }

  return (
    <>
      <section className="card space-y-5 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <h2 className="font-semibold">Thanh toán PayPal – tài khoản nhận tiền</h2>
            <p className="text-sm text-slate-500">
              Tiền khách trả vào tài khoản PayPal sở hữu ứng dụng REST API dưới đây. Lấy Client ID / Secret tại{" "}
              <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noopener" className="text-brand-600 underline">
                developer.paypal.com → Apps &amp; Credentials
              </a>{" "}
              (tạo app riêng cho Sandbox và Live).
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="accent-brand-600" />
            Bật bán gói trả phí
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="pp-mode">
              Chế độ
            </label>
            <select id="pp-mode" className="input" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as "sandbox" | "live" })}>
              <option value="sandbox">Sandbox (thử nghiệm, tiền giả)</option>
              <option value="live">Live (thu tiền thật)</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pp-currency">
              Đơn vị tiền
            </label>
            <select id="pp-currency" className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              {["USD", "EUR", "GBP", "AUD", "CAD", "JPY", "SGD", "HKD"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">PayPal không hỗ trợ VND.</p>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="pp-id">
              Client ID
            </label>
            <input id="pp-id" className="input font-mono text-xs" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} autoComplete="off" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="pp-secret">
              Client Secret
            </label>
            <input
              id="pp-secret"
              type="password"
              className="input font-mono text-xs"
              value={form.clientSecret}
              onChange={(e) => setForm({ ...form, clientSecret: e.target.value })}
              placeholder={hasSecret ? "●●●●●●●● đã lưu – để trống để giữ nguyên" : "Chưa có"}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div>
          <p className="label">Giá ({form.currency})</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {paidPlans.flatMap((plan) =>
              periods.map((period) => (
                <div key={`${plan}-${period}`}>
                  <label className="text-xs text-slate-500" htmlFor={`price-${plan}-${period}`}>
                    {planName[plan]} / {periodName[period].toLowerCase()}
                  </label>
                  <input
                    id={`price-${plan}-${period}`}
                    type="number"
                    min="0.5"
                    step="0.01"
                    className="input"
                    value={form.prices[plan][period]}
                    onChange={(e) => setPrice(plan, period, e.target.value)}
                  />
                </div>
              )),
            )}
          </div>
        </div>

        {msg && <p className={`rounded-lg p-3 text-sm ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
        <div className="flex justify-end">
          <button type="button" className="btn-primary" onClick={save} disabled={pending}>
            {pending ? "Đang lưu..." : "Lưu cấu hình thanh toán"}
          </button>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-1 font-semibold">Doanh thu &amp; giao dịch</h2>
        <p className="mb-4 text-sm text-slate-500">
          {revenue.length
            ? revenue.map((r) => `${r.total.toFixed(2)} ${r.currency} (${r.n} giao dịch)`).join(" · ")
            : "Chưa có giao dịch thành công."}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs text-slate-500">
              <tr>
                <th className="p-2 font-medium">Thời gian</th>
                <th className="p-2 font-medium">Người dùng</th>
                <th className="p-2 font-medium">Gói</th>
                <th className="p-2 text-right font-medium">Số tiền</th>
                <th className="p-2 font-medium">Trạng thái</th>
                <th className="p-2 font-medium">Mã đơn PayPal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-3 text-slate-500">
                    Chưa có giao dịch.
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="p-2 whitespace-nowrap">{fmtDate(p.created_at)}</td>
                  <td className="p-2">{p.email}</td>
                  <td className="p-2 whitespace-nowrap">
                    {planName[p.plan]} / {periodName[p.period]}
                  </td>
                  <td className="p-2 text-right whitespace-nowrap tabular-nums">
                    {p.amount} {p.currency}
                  </td>
                  <td className="p-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[p.status]}`}>{statusName[p.status]}</span>
                  </td>
                  <td className="p-2 font-mono text-xs text-slate-500">{p.order_id ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-1 font-semibold">Người dùng &amp; gói</h2>
        <p className="mb-4 text-sm text-slate-500">Đổi gói thủ công, vd khi khách chuyển khoản ngoài PayPal.</p>
        <form onSubmit={changePlan} className="mb-5 grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
          <div>
            <label className="label" htmlFor="up-email">
              Email người dùng
            </label>
            <input id="up-email" type="email" required className="input" value={planForm.email} onChange={(e) => setPlanForm({ ...planForm, email: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="up-plan">
              Gói
            </label>
            <select id="up-plan" className="input" value={planForm.plan} onChange={(e) => setPlanForm({ ...planForm, plan: e.target.value })}>
              {Object.entries(planName).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="up-exp">
              Hết hạn
            </label>
            <input
              id="up-exp"
              type="date"
              className="input"
              value={planForm.expires}
              disabled={planForm.plan === "free"}
              required={planForm.plan !== "free"}
              onChange={(e) => setPlanForm({ ...planForm, expires: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={pending}>
            Đổi gói
          </button>
        </form>
        {planMsg && <p className={`mb-4 rounded-lg p-3 text-sm ${planMsg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{planMsg.text}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs text-slate-500">
              <tr>
                <th className="p-2 font-medium">Email</th>
                <th className="p-2 font-medium">Tên</th>
                <th className="p-2 font-medium">Gói</th>
                <th className="p-2 font-medium">Hết hạn</th>
                <th className="p-2 text-right font-medium">Mã QR</th>
                <th className="p-2 font-medium">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const active = u.plan !== "free" && (u.plan_expires_at ?? 0) > Date.now();
                return (
                  <tr key={u.id}>
                    <td className="p-2">
                      <button type="button" className="text-brand-600 hover:underline" onClick={() => setPlanForm((f) => ({ ...f, email: u.email }))}>
                        {u.email}
                      </button>
                    </td>
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">
                      {planName[active ? u.plan : "free"]}
                      {u.plan !== "free" && !active && <span className="ml-1 text-xs text-slate-400">(đã hết hạn)</span>}
                    </td>
                    <td className="p-2 whitespace-nowrap">{u.plan !== "free" ? fmtDate(u.plan_expires_at) : "—"}</td>
                    <td className="p-2 text-right tabular-nums">{u.codes}</td>
                    <td className="p-2 whitespace-nowrap">{fmtDate(u.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
