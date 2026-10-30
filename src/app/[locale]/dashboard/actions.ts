"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SavedDesign } from "@/components/QrGenerator";
import { isLocale } from "@/i18n/config";
import { createQr, deleteQr, QrError, saveDesign, updateQr } from "@/lib/dynamic-qr";
import { isDynamicType, readFields } from "@/lib/dynamic-types";
import type { FieldValues } from "@/lib/qr-types";
import { getUser, userPlan } from "@/lib/user-auth";

/** values/name: giá trị đã nhập, trả lại khi lỗi để form điền lại (React 19 xoá trắng form sau khi gửi). */
export type FormState = { error?: string; ok?: boolean; values?: FieldValues; name?: string } | undefined;

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
  const type = formData.get("type");
  const name = String(formData.get("name") ?? "");
  const fields = readFields(formData);
  if (!isDynamicType(type)) return { error: "invalidType", name, values: fields };
  let id: string;
  try {
    id = await createQr(user.id, userPlan(user), { name, type, url: fields?.url, file: fileOf(formData), fields });
  } catch (e) {
    return { error: errorCode(e), name, values: fields };
  }
  revalidatePath(`/${locale}/dashboard`);
  redirect(`/${locale}/dashboard/qr/${id}`);
}

export async function updateQrAction(locale: string, id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  const name = String(formData.get("name") ?? "");
  const fields = readFields(formData);
  if (!user) return { error: "unknown", name, values: fields };
  try {
    await updateQr(user.id, userPlan(user), id, { name, url: fields?.url, file: fileOf(formData), fields });
  } catch (e) {
    // Trả lại giá trị đã nhập để form điền lại (React xoá trắng form sau khi gửi)
    return { error: errorCode(e), name, values: fields };
  }
  revalidatePath(`/${locale}/dashboard`, "layout");
  return { ok: true };
}

export async function setActiveAction(locale: string, id: string, active: boolean) {
  const user = await getUser();
  if (!user) return;
  await updateQr(user.id, userPlan(user), id, { active }).catch(() => {});
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
