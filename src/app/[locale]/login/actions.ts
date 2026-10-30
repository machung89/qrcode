"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale } from "@/i18n/config";
import { AuthError, loginWithPassword, registerWithPassword, startSession } from "@/lib/user-auth";

export type AuthFormState = { error?: string; email?: string; name?: string } | undefined;

function errorCode(e: unknown) {
  if (e instanceof AuthError) return e.code;
  console.error(e);
  return "unknown";
}

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "");
const dashboard = (locale: string) => `/${isLocale(locale) ? locale : defaultLocale}/dashboard`;

export async function registerAction(locale: string, _prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = text(formData, "name");
  const email = text(formData, "email");
  try {
    const userId = await registerWithPassword({
      name,
      email,
      password: text(formData, "password"),
      confirm: text(formData, "confirm"),
      agree: formData.get("agree") === "on",
    });
    await startSession(userId);
  } catch (e) {
    // Giữ lại tên/email đã nhập, không trả lại mật khẩu
    return { error: errorCode(e), name, email };
  }
  redirect(dashboard(locale));
}

export async function loginAction(locale: string, _prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = text(formData, "email");
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  try {
    await startSession(await loginWithPassword(email, text(formData, "password"), ip));
  } catch (e) {
    return { error: errorCode(e), email };
  }
  redirect(dashboard(locale));
}
