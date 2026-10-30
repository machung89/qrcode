"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SavedDesign } from "@/components/QrGenerator";
import { isLocale } from "@/i18n/config";
import { createQr, deleteQr, QrError, saveDesign, updateQr, type QrKind } from "@/lib/dynamic-qr";
import { getUser } from "@/lib/user-auth";

export type FormState = { error?: string; ok?: boolean } | undefined;

function errorCode(e: unknown) {
  if (e instanceof QrError) return e.code;
  console.error(e);
  return "unknown";
}

const fileOf = (formData: FormData) => {
  const f = formData.get("file");
  return f instanceof File && f.size > 0 ? f : null;
};

export async function createQrAction(locale: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user || !isLocale(locale)) return { error: "unknown" };
  let id: string;
  try {
    id = await createQr(user.id, {
      name: String(formData.get("name") ?? ""),
      kind: (formData.get("kind") === "pdf" ? "pdf" : "url") as QrKind,
      url: String(formData.get("url") ?? ""),
      file: fileOf(formData),
    });
  } catch (e) {
    return { error: errorCode(e) };
  }
  revalidatePath(`/${locale}/dashboard`);
  redirect(`/${locale}/dashboard/qr/${id}`);
}

export async function updateQrAction(locale: string, id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "unknown" };
  try {
    await updateQr(user.id, id, {
      name: String(formData.get("name") ?? ""),
      url: formData.has("url") ? String(formData.get("url")) : undefined,
      file: fileOf(formData),
    });
  } catch (e) {
    return { error: errorCode(e) };
  }
  revalidatePath(`/${locale}/dashboard`, "layout");
  return { ok: true };
}

export async function setActiveAction(locale: string, id: string, active: boolean) {
  const user = await getUser();
  if (!user) return;
  await updateQr(user.id, id, { active }).catch(() => {});
  revalidatePath(`/${locale}/dashboard`, "layout");
}

export async function deleteQrAction(locale: string, id: string) {
  const user = await getUser();
  if (!user) return;
  await deleteQr(user.id, id);
  revalidatePath(`/${locale}/dashboard`, "layout");
  redirect(`/${locale}/dashboard`);
}

export async function saveDesignAction(id: string, saved: SavedDesign): Promise<boolean> {
  const user = await getUser();
  if (!user || !saved || typeof saved !== "object" || !saved.design || !saved.frame) return false;
  // Logo chỉ chấp nhận ảnh nhúng dạng data:image/...
  if (saved.design.logo && !/^data:image\/[\w.+-]+;base64,/.test(saved.design.logo)) saved.design.logo = null;
  const json = JSON.stringify({ design: saved.design, frame: saved.frame });
  if (json.length > 1_500_000) return false;
  await saveDesign(user.id, id, json);
  return true;
}
