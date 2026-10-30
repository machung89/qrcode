import "server-only";
import { db } from "./db";
import { newId } from "./user-auth";

export const ticketCategories = ["general", "billing", "qr", "bug", "other"] as const;
export type TicketCategory = (typeof ticketCategories)[number];
export const isTicketCategory = (v: unknown): v is TicketCategory => ticketCategories.includes(v as TicketCategory);

export type TicketStatus = "open" | "answered" | "closed";
export const isTicketStatus = (v: unknown): v is TicketStatus => v === "open" || v === "answered" || v === "closed";

export const SUBJECT_MAX = 150;
export const BODY_MAX = 5000;
/** Chống spam: số ticket chưa đóng tối đa của một người dùng */
export const OPEN_TICKETS_MAX = 5;

export type Ticket = {
  id: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  user_unread: number;
  created_at: number;
  updated_at: number;
};
export type TicketMessage = { id: string; author: "user" | "admin"; body: string; created_at: number };
export type AdminTicket = Ticket & { email: string; name: string; plan: string; plan_expires_at: number | null; messages: number };

export class SupportError extends Error {
  constructor(public code: "required" | "tooLong" | "tooMany" | "notFound") {
    super(code);
  }
}

function cleanBody(body: string) {
  const text = body.replace(/\r\n/g, "\n").trim();
  if (!text) throw new SupportError("required");
  if (text.length > BODY_MAX) throw new SupportError("tooLong");
  return text;
}

// ---------- Người dùng ----------

export async function createTicket(userId: string, input: { subject: string; category: string; body: string }) {
  const subject = input.subject.replace(/\s+/g, " ").trim();
  if (!subject) throw new SupportError("required");
  if (subject.length > SUBJECT_MAX) throw new SupportError("tooLong");
  const body = cleanBody(input.body);
  const category = isTicketCategory(input.category) ? input.category : "other";
  const d = await db();
  const open = await d.prepare("SELECT COUNT(*) AS n FROM tickets WHERE user_id = ? AND status != 'closed'").bind(userId).first<{ n: number }>();
  if ((open?.n ?? 0) >= OPEN_TICKETS_MAX) throw new SupportError("tooMany");
  const id = newId();
  const now = Date.now();
  await d.batch([
    d.prepare("INSERT INTO tickets (id, user_id, subject, category, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'open', ?, ?)").bind(id, userId, subject, category, now, now),
    d.prepare("INSERT INTO ticket_messages (id, ticket_id, author, body, created_at) VALUES (?, ?, 'user', ?, ?)").bind(newId(), id, body, now),
  ]);
  return id;
}

export async function listTickets(userId: string): Promise<Ticket[]> {
  const { results } = await (await db())
    .prepare("SELECT id, subject, category, status, user_unread, created_at, updated_at FROM tickets WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100")
    .bind(userId)
    .all<Ticket>();
  return results;
}

/** Số ticket có câu trả lời mới mà người dùng chưa xem */
export async function unreadTickets(userId: string) {
  const row = await (await db()).prepare("SELECT COUNT(*) AS n FROM tickets WHERE user_id = ? AND user_unread = 1").bind(userId).first<{ n: number }>();
  return row?.n ?? 0;
}

async function messagesOf(ticketId: string) {
  const { results } = await (await db())
    .prepare("SELECT id, author, body, created_at FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at, rowid")
    .bind(ticketId)
    .all<TicketMessage>();
  return results;
}

/** Ticket của chính người dùng (null nếu không phải của họ). Xem xong thì bỏ đánh dấu chưa đọc. */
export async function getTicket(userId: string, id: string) {
  const d = await db();
  const ticket = await d
    .prepare("SELECT id, subject, category, status, user_unread, created_at, updated_at FROM tickets WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .first<Ticket>();
  if (!ticket) return null;
  if (ticket.user_unread) await d.prepare("UPDATE tickets SET user_unread = 0 WHERE id = ?").bind(id).run();
  return { ticket, messages: await messagesOf(id) };
}

/** Người dùng trả lời: ticket (kể cả đã đóng) quay về trạng thái chờ admin */
export async function replyTicket(userId: string, id: string, body: string) {
  const text = cleanBody(body);
  const d = await db();
  const now = Date.now();
  const res = await d.prepare("UPDATE tickets SET status = 'open', user_unread = 0, updated_at = ? WHERE id = ? AND user_id = ?").bind(now, id, userId).run();
  if (!res.meta.changes) throw new SupportError("notFound");
  await d.prepare("INSERT INTO ticket_messages (id, ticket_id, author, body, created_at) VALUES (?, ?, 'user', ?, ?)").bind(newId(), id, text, now).run();
}

export async function closeTicket(userId: string, id: string) {
  await (await db()).prepare("UPDATE tickets SET status = 'closed', updated_at = ? WHERE id = ? AND user_id = ?").bind(Date.now(), id, userId).run();
}

// ---------- Quản trị ----------

const ADMIN_SELECT = `SELECT t.id, t.subject, t.category, t.status, t.user_unread, t.created_at, t.updated_at,
  u.email, u.name, u.plan, u.plan_expires_at, (SELECT COUNT(*) FROM ticket_messages m WHERE m.ticket_id = t.id) AS messages
  FROM tickets t JOIN users u ON u.id = t.user_id`;

export async function adminListTickets(status: TicketStatus | "all"): Promise<AdminTicket[]> {
  const d = await db();
  const q =
    status === "all"
      ? d.prepare(`${ADMIN_SELECT} ORDER BY t.updated_at DESC LIMIT 200`)
      : d.prepare(`${ADMIN_SELECT} WHERE t.status = ? ORDER BY t.updated_at ${status === "open" ? "ASC" : "DESC"} LIMIT 200`).bind(status);
  return (await q.all<AdminTicket>()).results;
}

export async function adminTicketCounts() {
  const { results } = await (await db()).prepare("SELECT status, COUNT(*) AS n FROM tickets GROUP BY status").all<{ status: TicketStatus; n: number }>();
  const counts: Record<TicketStatus, number> = { open: 0, answered: 0, closed: 0 };
  for (const r of results) counts[r.status] = r.n;
  return counts;
}

export async function adminGetTicket(id: string) {
  const ticket = await (await db()).prepare(`${ADMIN_SELECT} WHERE t.id = ?`).bind(id).first<AdminTicket>();
  return ticket ? { ticket, messages: await messagesOf(id) } : null;
}

export async function adminReply(id: string, body: string, close: boolean) {
  const text = cleanBody(body);
  const d = await db();
  const now = Date.now();
  const res = await d
    .prepare("UPDATE tickets SET status = ?, user_unread = 1, updated_at = ? WHERE id = ?")
    .bind(close ? "closed" : "answered", now, id)
    .run();
  if (!res.meta.changes) throw new SupportError("notFound");
  await d.prepare("INSERT INTO ticket_messages (id, ticket_id, author, body, created_at) VALUES (?, ?, 'admin', ?, ?)").bind(newId(), id, text, now).run();
}

export async function adminSetStatus(id: string, status: TicketStatus) {
  await (await db()).prepare("UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?").bind(status, Date.now(), id).run();
}
