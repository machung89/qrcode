import "server-only";
import { db } from "./db";
import { addPeriod, defaultPrices, isPaidPlan, paidPlans, periods, type PaidPlan, type Period } from "./plans";
import { newId } from "./user-auth";

// ---------- Cấu hình (lưu trong bảng settings, sửa ở trang admin) ----------

export type PaypalMode = "sandbox" | "live";

export type BillingConfig = {
  /** Bật/tắt bán gói trả phí */
  enabled: boolean;
  /** Tài khoản PayPal nhận tiền: thông tin ứng dụng REST API của tài khoản đó */
  mode: PaypalMode;
  clientId: string;
  clientSecret: string;
  currency: string;
  prices: Record<PaidPlan, Record<Period, number>>;
};

/** Phần công khai (không có Client Secret), dùng cho trang Bảng giá. */
export type PublicBilling = { enabled: boolean; currency: string; prices: BillingConfig["prices"] };

const KEY = "billing";
const CURRENCIES = ["USD", "EUR", "GBP", "AUD", "CAD", "JPY", "SGD", "HKD"];

export const emptyBilling: BillingConfig = {
  enabled: false,
  mode: "sandbox",
  clientId: "",
  clientSecret: "",
  currency: "USD",
  prices: structuredClone(defaultPrices),
};

export function sanitizeBilling(input: unknown, previous: BillingConfig = emptyBilling): BillingConfig {
  const o = (input ?? {}) as Partial<BillingConfig>;
  const prices = structuredClone(previous.prices);
  for (const plan of paidPlans)
    for (const period of periods) {
      const v = Number(o.prices?.[plan]?.[period]);
      if (Number.isFinite(v) && v > 0 && v < 100000) prices[plan][period] = Math.round(v * 100) / 100;
    }
  return {
    enabled: o.enabled === true,
    mode: o.mode === "live" ? "live" : "sandbox",
    clientId: String(o.clientId ?? previous.clientId).trim(),
    // Ô Secret để trống nghĩa là giữ nguyên Secret đã lưu
    clientSecret: o.clientSecret ? String(o.clientSecret).trim() : previous.clientSecret,
    currency: CURRENCIES.includes(String(o.currency)) ? String(o.currency) : previous.currency,
    prices,
  };
}

export async function readBilling(): Promise<BillingConfig> {
  try {
    const row = await (await db()).prepare("SELECT value FROM settings WHERE key = ?").bind(KEY).first<{ value: string }>();
    return row ? sanitizeBilling(JSON.parse(row.value), emptyBilling) : structuredClone(emptyBilling);
  } catch {
    return structuredClone(emptyBilling);
  }
}

export async function writeBilling(config: BillingConfig) {
  await (await db())
    .prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .bind(KEY, JSON.stringify(config), Date.now())
    .run();
}

export const billingReady = (c: BillingConfig) => c.enabled && !!c.clientId && !!c.clientSecret;

export function publicBilling(c: BillingConfig): PublicBilling {
  return { enabled: billingReady(c), currency: c.currency, prices: c.prices };
}

/** "2.99" (JPY không có phần lẻ) */
export const formatAmount = (value: number, currency: string) => (currency === "JPY" ? String(Math.round(value)) : value.toFixed(2));

// ---------- PayPal REST API (Orders v2) ----------

export class PaypalError extends Error {}

function apiBase(mode: PaypalMode) {
  // PAYPAL_API_BASE chỉ dùng khi chạy test với PayPal giả lập
  return process.env.PAYPAL_API_BASE || (mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com");
}

async function accessToken(c: BillingConfig) {
  const res = await fetch(`${apiBase(c.mode)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${c.clientId}:${c.clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new PaypalError(`PayPal auth ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function paypal<T>(c: BillingConfig, path: string, body: unknown, requestId: string): Promise<T> {
  const res = await fetch(`${apiBase(c.mode)}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await accessToken(c)}`,
      "Content-Type": "application/json",
      // Gửi lại cùng request (vd mạng chập chờn) không tạo đơn / thu tiền 2 lần
      "PayPal-Request-Id": requestId,
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { message?: string; name?: string };
  if (!res.ok) throw new PaypalError(`PayPal ${path} ${res.status} ${data.name ?? ""} ${data.message ?? ""}`);
  return data;
}

type PaypalOrder = {
  id: string;
  status: string;
  links?: { rel: string; href: string }[];
  payer?: { email_address?: string };
  purchase_units?: {
    custom_id?: string;
    payments?: { captures?: { id: string; status: string; amount: { currency_code: string; value: string } }[] };
  }[];
};

// ---------- Thanh toán ----------

export type Payment = {
  id: string;
  user_id: string;
  order_id: string | null;
  plan: PaidPlan;
  period: Period;
  amount: string;
  currency: string;
  status: "created" | "completed" | "failed";
  payer_email: string | null;
  created_at: number;
  completed_at: number | null;
};

/** Tạo đơn PayPal cho gói đã chọn, trả về link để khách duyệt thanh toán. */
export async function startCheckout(input: { userId: string; plan: PaidPlan; period: Period; returnUrl: string; cancelUrl: string; brand: string; locale: string }) {
  const c = await readBilling();
  if (!billingReady(c)) throw new PaypalError("Billing is not configured");
  const amount = formatAmount(c.prices[input.plan][input.period], c.currency);
  const paymentId = newId();
  const d = await db();
  await d
    .prepare("INSERT INTO payments (id, user_id, provider, plan, period, amount, currency, status, created_at) VALUES (?, ?, 'paypal', ?, ?, ?, ?, 'created', ?)")
    .bind(paymentId, input.userId, input.plan, input.period, amount, c.currency, Date.now())
    .run();

  const order = await paypal<PaypalOrder>(
    c,
    "/v2/checkout/orders",
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `${input.plan}-${input.period}`,
          custom_id: paymentId,
          description: `${input.brand} – ${input.plan} (${input.period})`,
          amount: { currency_code: c.currency, value: amount },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: input.brand.slice(0, 127),
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING",
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl,
          },
        },
      },
    },
    `create-${paymentId}`,
  );
  await d.prepare("UPDATE payments SET order_id = ? WHERE id = ?").bind(order.id, paymentId).run();
  const approve = order.links?.find((l) => l.rel === "payer-action" || l.rel === "approve")?.href;
  if (!approve) throw new PaypalError("PayPal did not return an approval link");
  return approve;
}

/**
 * Khách quay lại từ PayPal: thu tiền (capture) rồi nâng gói.
 * Chỉ nâng gói khi PayPal xác nhận COMPLETED đúng số tiền, đúng loại tiền và đúng đơn của người dùng này.
 */
export async function completeCheckout(userId: string, orderId: string): Promise<Payment> {
  const d = await db();
  const payment = await d.prepare("SELECT * FROM payments WHERE order_id = ? AND user_id = ?").bind(orderId, userId).first<Payment>();
  if (!payment) throw new PaypalError("Payment not found");
  if (payment.status === "completed") return payment; // đã xử lý (vd khách tải lại trang)

  const c = await readBilling();
  let order: PaypalOrder;
  try {
    order = await paypal<PaypalOrder>(c, `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {}, `capture-${payment.id}`);
  } catch (e) {
    await d.prepare("UPDATE payments SET status = 'failed' WHERE id = ? AND status = 'created'").bind(payment.id).run();
    throw e;
  }
  const unit = order.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const valid =
    order.status === "COMPLETED" &&
    capture?.status === "COMPLETED" &&
    unit?.custom_id === payment.id &&
    capture.amount.currency_code === payment.currency &&
    Number(capture.amount.value) === Number(payment.amount);
  if (!valid) {
    await d.prepare("UPDATE payments SET status = 'failed' WHERE id = ? AND status = 'created'").bind(payment.id).run();
    throw new PaypalError(`Capture not valid: ${order.status} ${capture?.status} ${capture?.amount?.value} ${capture?.amount?.currency_code}`);
  }

  // Đánh dấu hoàn tất có điều kiện để 2 request song song không cộng hạn 2 lần
  const done = await d
    .prepare("UPDATE payments SET status = 'completed', completed_at = ?, payer_email = ? WHERE id = ? AND status = 'created'")
    .bind(Date.now(), order.payer?.email_address ?? null, payment.id)
    .run();
  if (done.meta.changes === 1) await extendPlan(userId, payment.plan, payment.period);
  return { ...payment, status: "completed" };
}

/** Cộng thời hạn: cùng gói thì nối tiếp hạn hiện tại; đổi gói thì tính lại từ hôm nay. */
export async function extendPlan(userId: string, plan: PaidPlan, period: Period) {
  const d = await db();
  const user = await d.prepare("SELECT plan, plan_expires_at FROM users WHERE id = ?").bind(userId).first<{ plan: string; plan_expires_at: number | null }>();
  const now = Date.now();
  const from = user?.plan === plan && (user.plan_expires_at ?? 0) > now ? user.plan_expires_at! : now;
  await d.prepare("UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?").bind(plan, addPeriod(from, period), userId).run();
}

export async function listPayments(userId: string) {
  const { results } = await (await db())
    .prepare("SELECT * FROM payments WHERE user_id = ? AND status = 'completed' ORDER BY created_at DESC LIMIT 50")
    .bind(userId)
    .all<Payment>();
  return results;
}

// ---------- Dành cho trang admin ----------

export type AdminPayment = Payment & { email: string };
export type AdminUser = { id: string; email: string; name: string; plan: string; plan_expires_at: number | null; created_at: number; codes: number };

export async function adminOverview() {
  const d = await db();
  const [payments, users, totals] = await d.batch([
    d.prepare("SELECT p.*, u.email FROM payments p JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC LIMIT 100"),
    d.prepare(
      `SELECT u.id, u.email, u.name, u.plan, u.plan_expires_at, u.created_at,
         (SELECT COUNT(*) FROM qr_codes q WHERE q.user_id = u.id) AS codes
       FROM users u ORDER BY u.created_at DESC LIMIT 200`,
    ),
    d.prepare("SELECT currency, SUM(CAST(amount AS REAL)) AS total, COUNT(*) AS n FROM payments WHERE status = 'completed' GROUP BY currency"),
  ]);
  return {
    payments: payments.results as AdminPayment[],
    users: users.results as AdminUser[],
    revenue: totals.results as { currency: string; total: number; n: number }[],
  };
}

/** Admin đổi gói thủ công (vd khách chuyển khoản ngoài PayPal). */
export async function setUserPlan(email: string, plan: string, expiresAt: number | null) {
  const target = isPaidPlan(plan) ? plan : "free";
  const res = await (await db())
    .prepare("UPDATE users SET plan = ?, plan_expires_at = ? WHERE email = ? COLLATE NOCASE")
    .bind(target, target === "free" ? null : expiresAt, email.trim())
    .run();
  return res.meta.changes;
}

