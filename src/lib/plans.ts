// Các gói dịch vụ và giới hạn. Dùng được ở cả server và trình duyệt.

export const plans = ["free", "personal", "business"] as const;
export type Plan = (typeof plans)[number];
export type PaidPlan = Exclude<Plan, "free">;
export const paidPlans: PaidPlan[] = ["personal", "business"];

export const periods = ["month", "year"] as const;
export type Period = (typeof periods)[number];

export type PlanLimits = {
  /** Số mã QR động tối đa */
  codes: number;
  /** Số file PDF tối đa */
  pdfFiles: number;
  /** Dung lượng tối đa mỗi file PDF (byte) */
  pdfBytes: number;
  /** Số ngày hiển thị trên biểu đồ lượt quét */
  statsDays: number;
  /** Xem phân tích thiết bị / hệ điều hành / trình duyệt / quốc gia */
  breakdowns: boolean;
  /** Trang hiển thị mã động và dashboard không có quảng cáo */
  noAds: boolean;
};

const MB = 1024 * 1024;

export const planLimits: Record<Plan, PlanLimits> = {
  free: { codes: 3, pdfFiles: 1, pdfBytes: 2 * MB, statsDays: 7, breakdowns: false, noAds: false },
  personal: { codes: 50, pdfFiles: 20, pdfBytes: 10 * MB, statsDays: 30, breakdowns: true, noAds: true },
  business: { codes: 500, pdfFiles: 200, pdfBytes: 25 * MB, statsDays: 30, breakdowns: true, noAds: true },
};

export const isPlan = (v: unknown): v is Plan => typeof v === "string" && (plans as readonly string[]).includes(v);
export const isPaidPlan = (v: unknown): v is PaidPlan => typeof v === "string" && (paidPlans as string[]).includes(v);
export const isPeriod = (v: unknown): v is Period => typeof v === "string" && (periods as readonly string[]).includes(v);

/** Gói đang có hiệu lực: gói trả phí đã hết hạn thì coi như Miễn phí. */
export function effectivePlan(plan: string | null | undefined, expiresAt: number | null | undefined, now = Date.now()): Plan {
  return isPaidPlan(plan) && (expiresAt ?? 0) > now ? plan : "free";
}

/** Giá mặc định (USD); admin đổi được trong trang quản trị. */
export const defaultPrices: Record<PaidPlan, Record<Period, number>> = {
  personal: { month: 2.99, year: 24.99 },
  business: { month: 9.99, year: 79.99 },
};

/** Cộng thêm 1 tháng / 1 năm vào thời điểm `from` (giữ nguyên ngày trong tháng). */
export function addPeriod(from: number, period: Period) {
  const d = new Date(from);
  if (period === "month") d.setUTCMonth(d.getUTCMonth() + 1);
  else d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d.getTime();
}
