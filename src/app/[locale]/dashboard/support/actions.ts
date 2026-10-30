"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { closeTicket, createTicket, replyTicket, SupportError } from "@/lib/support";
import { getUser } from "@/lib/user-auth";

/** values: nội dung đã nhập, trả lại khi lỗi để form điền lại (React 19 xoá trắng form sau khi gửi). */
export type TicketFormState = { error?: string; values?: { subject?: string; category?: string; body?: string } } | undefined;

function errorCode(e: unknown) {
  if (e instanceof SupportError) return e.code;
  console.error(e);
  return "unknown";
}

export async function createTicketAction(locale: string, _prev: TicketFormState, formData: FormData): Promise<TicketFormState> {
  const values = { subject: String(formData.get("subject") ?? ""), category: String(formData.get("category") ?? ""), body: String(formData.get("body") ?? "") };
  const user = await getUser();
  if (!user || !isLocale(locale)) return { error: "unknown", values };
  let id: string;
  try {
    id = await createTicket(user.id, values);
  } catch (e) {
    return { error: errorCode(e), values };
  }
  revalidatePath(`/${locale}/dashboard/support`);
  redirect(`/${locale}/dashboard/support/${id}`);
}

export async function replyTicketAction(locale: string, id: string, _prev: TicketFormState, formData: FormData): Promise<TicketFormState> {
  const body = String(formData.get("body") ?? "");
  const user = await getUser();
  if (!user) return { error: "unknown", values: { body } };
  try {
    await replyTicket(user.id, id, body);
  } catch (e) {
    return { error: errorCode(e), values: { body } };
  }
  revalidatePath(`/${locale}/dashboard/support`, "layout");
  return {};
}

export async function closeTicketAction(locale: string, id: string) {
  const user = await getUser();
  if (!user) return;
  await closeTicket(user.id, id);
  revalidatePath(`/${locale}/dashboard/support`, "layout");
}
