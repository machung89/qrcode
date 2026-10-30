"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, createSession, destroySession, isAuthenticated } from "@/lib/auth";
import { sanitizeConfig, writeAdsConfig } from "@/lib/ads/store";
import type { AdsConfig } from "@/lib/ads/types";

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
    // Tạo lại các trang tĩnh để áp dụng quảng cáo mới
    revalidatePath("/", "layout");
    revalidatePath("/[locale]", "layout");
    return { ok: true, config };
  } catch (e) {
    return { ok: false, error: `Không lưu được: ${(e as Error).message}` };
  }
}
