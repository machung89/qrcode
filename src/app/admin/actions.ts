"use server";

import { redirect } from "next/navigation";
import { checkPassword, createSession, destroySession, isAuthenticated } from "@/lib/auth";
import { sanitizeConfig, writeAdsConfig } from "@/lib/ads/store";
import type { AdsConfig } from "@/lib/ads/types";
import { readBilling, sanitizeBilling, setUserPlan, writeBilling, type BillingConfig } from "@/lib/billing";

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!process.env.ADMIN_PASSWORD) return { error: "Chưa cấu hình ADMIN_PASSWORD trong file .env" };
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 800)); // làm chậm dò mật khẩu
    return { error: "Mật khẩu không đúng" };
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function saveConfig(input: AdsConfig): Promise<{ ok: boolean; error?: string; config?: AdsConfig }> {
  if (!(await isAuthenticated())) return { ok: false, error: "Phiên đăng nhập đã hết hạn, hãy đăng nhập lại." };
  try {
    const config = sanitizeConfig(input);
    await writeAdsConfig(config);
    return { ok: true, config };
  } catch (e) {
    return { ok: false, error: `Không lưu được: ${(e as Error).message}` };
  }
}

/** Lưu cấu hình thanh toán PayPal. Ô Client Secret để trống = giữ Secret cũ. */
export async function saveBillingAction(input: Partial<BillingConfig>): Promise<{ ok: boolean; error?: string; hasSecret?: boolean }> {
  if (!(await isAuthenticated())) return { ok: false, error: "Phiên đăng nhập đã hết hạn, hãy đăng nhập lại." };
  const config = sanitizeBilling(input, await readBilling());
  if (config.enabled && (!config.clientId || !config.clientSecret)) {
    return { ok: false, error: "Cần nhập Client ID và Client Secret trước khi bật bán gói." };
  }
  await writeBilling(config);
  return { ok: true, hasSecret: !!config.clientSecret };
}

/** Đổi gói thủ công cho người dùng (theo email). expires: "YYYY-MM-DD" hoặc trống với gói Miễn phí. */
export async function setUserPlanAction(email: string, plan: string, expires: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAuthenticated())) return { ok: false, error: "Phiên đăng nhập đã hết hạn, hãy đăng nhập lại." };
  const expiresAt = expires ? Date.parse(`${expires}T23:59:59Z`) : NaN;
  if (plan !== "free" && !(expiresAt > Date.now())) return { ok: false, error: "Ngày hết hạn phải ở tương lai." };
  const changed = await setUserPlan(email, plan, Number.isNaN(expiresAt) ? null : expiresAt);
  return changed ? { ok: true } : { ok: false, error: `Không tìm thấy người dùng có email ${email}` };
}
