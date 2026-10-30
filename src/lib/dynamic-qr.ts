import "server-only";
import { createHash, randomInt } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { db, UPLOAD_DIR } from "./db";
import { newId } from "./user-auth";

export const MAX_PDF_BYTES = 10 * 1024 * 1024;
export const MAX_CODES_PER_USER = 100;

export type QrKind = "url" | "pdf";

export type DynamicQr = {
  id: string;
  slug: string;
  name: string;
  kind: QrKind;
  target_url: string | null;
  file_id: string | null;
  file_name: string | null;
  file_size: number | null;
  design: string | null;
  active: number;
  created_at: number;
  updated_at: number;
};

export type QrListItem = DynamicQr & { scans: number; last_scan: number | null };

// Bỏ các ký tự dễ nhầm (0/O, 1/l/I)
const SLUG_CHARS = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
function newSlug() {
  for (;;) {
    let slug = "";
    for (let i = 0; i < 7; i++) slug += SLUG_CHARS[randomInt(SLUG_CHARS.length)];
    if (!db().prepare("SELECT 1 FROM qr_codes WHERE slug = ?").get(slug)) return slug;
  }
}

/** Chuẩn hoá URL đích; trả về null nếu không hợp lệ (chỉ cho phép http/https). */
export function normalizeUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

// ---------- File PDF ----------

export async function savePdf(userId: string, file: File) {
  if (file.size > MAX_PDF_BYTES) throw new QrError("fileTooLarge");
  const bytes = Buffer.from(await file.arrayBuffer());
  // Kiểm tra chữ ký "%PDF-" thay vì tin vào phần mở rộng
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") throw new QrError("fileType");
  const id = newId(16);
  await fs.writeFile(path.join(UPLOAD_DIR, `${id}.pdf`), bytes);
  const name = (file.name || "document.pdf").replace(/[\\/\r\n"]/g, "_").slice(0, 150);
  db()
    .prepare("INSERT INTO files (id, user_id, original_name, size, mime, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, userId, name, bytes.length, "application/pdf", Date.now());
  return id;
}

async function deleteFile(fileId: string) {
  db().prepare("DELETE FROM files WHERE id = ?").run(fileId);
  await fs.rm(path.join(UPLOAD_DIR, `${fileId}.pdf`), { force: true });
}

export function getFile(fileId: string) {
  return db().prepare("SELECT id, original_name, size, mime FROM files WHERE id = ?").get(fileId) as
    | { id: string; original_name: string; size: number; mime: string }
    | undefined;
}

export const filePath = (fileId: string) => path.join(UPLOAD_DIR, `${fileId}.pdf`);

// ---------- Mã QR động ----------

export class QrError extends Error {
  constructor(public code: "invalidUrl" | "fileRequired" | "fileTooLarge" | "fileType" | "notFound" | "limit" | "nameRequired") {
    super(code);
  }
}

const SELECT_QR = `SELECT q.*, f.original_name AS file_name, f.size AS file_size
  FROM qr_codes q LEFT JOIN files f ON f.id = q.file_id`;

export function listQrs(userId: string): QrListItem[] {
  return db()
    .prepare(
      `SELECT q.*, f.original_name AS file_name, f.size AS file_size,
         (SELECT COUNT(*) FROM scans s WHERE s.qr_id = q.id) AS scans,
         (SELECT MAX(ts) FROM scans s WHERE s.qr_id = q.id) AS last_scan
       FROM qr_codes q LEFT JOIN files f ON f.id = q.file_id
       WHERE q.user_id = ? ORDER BY q.created_at DESC`,
    )
    .all(userId) as QrListItem[];
}

export function getQr(userId: string, id: string) {
  return db().prepare(`${SELECT_QR} WHERE q.id = ? AND q.user_id = ?`).get(id, userId) as DynamicQr | undefined;
}

export async function createQr(userId: string, input: { name: string; kind: QrKind; url?: string; file?: File | null }) {
  const name = input.name.trim().slice(0, 120);
  if (!name) throw new QrError("nameRequired");
  const count = (db().prepare("SELECT COUNT(*) AS n FROM qr_codes WHERE user_id = ?").get(userId) as { n: number }).n;
  if (count >= MAX_CODES_PER_USER) throw new QrError("limit");

  let targetUrl: string | null = null;
  let fileId: string | null = null;
  if (input.kind === "url") {
    targetUrl = normalizeUrl(input.url ?? "");
    if (!targetUrl) throw new QrError("invalidUrl");
  } else {
    if (!input.file || !input.file.size) throw new QrError("fileRequired");
    fileId = await savePdf(userId, input.file);
  }

  const id = newId();
  const now = Date.now();
  db()
    .prepare(
      `INSERT INTO qr_codes (id, user_id, slug, name, kind, target_url, file_id, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    )
    .run(id, userId, newSlug(), name, input.kind, targetUrl, fileId, now, now);
  return id;
}

export async function updateQr(userId: string, id: string, input: { name?: string; url?: string; file?: File | null; active?: boolean }) {
  const qr = getQr(userId, id);
  if (!qr) throw new QrError("notFound");
  const name = input.name !== undefined ? input.name.trim().slice(0, 120) : qr.name;
  if (!name) throw new QrError("nameRequired");

  let targetUrl = qr.target_url;
  let fileId = qr.file_id;
  if (qr.kind === "url" && input.url !== undefined) {
    targetUrl = normalizeUrl(input.url);
    if (!targetUrl) throw new QrError("invalidUrl");
  }
  if (qr.kind === "pdf" && input.file && input.file.size) {
    fileId = await savePdf(userId, input.file);
  }
  const active = input.active !== undefined ? (input.active ? 1 : 0) : qr.active;

  db()
    .prepare("UPDATE qr_codes SET name = ?, target_url = ?, file_id = ?, active = ?, updated_at = ? WHERE id = ? AND user_id = ?")
    .run(name, targetUrl, fileId, active, Date.now(), id, userId);
  if (qr.file_id && qr.file_id !== fileId) await deleteFile(qr.file_id);
}

export function saveDesign(userId: string, id: string, design: string) {
  db().prepare("UPDATE qr_codes SET design = ?, updated_at = ? WHERE id = ? AND user_id = ?").run(design, Date.now(), id, userId);
}

export async function deleteQr(userId: string, id: string) {
  const qr = getQr(userId, id);
  if (!qr) return;
  db().prepare("DELETE FROM qr_codes WHERE id = ? AND user_id = ?").run(id, userId);
  if (qr.file_id) await deleteFile(qr.file_id);
}

// ---------- Lượt quét ----------

export function findBySlug(slug: string) {
  return db().prepare("SELECT id, kind, target_url, file_id, active FROM qr_codes WHERE slug = ?").get(slug) as
    | Pick<DynamicQr, "id" | "kind" | "target_url" | "file_id" | "active">
    | undefined;
}

export function recordScan(qrId: string, info: { ip: string; device: string; os: string; browser: string; country: string }) {
  // Không lưu IP thật: chỉ lưu mã băm để đếm người dùng duy nhất
  const secret = process.env.ADMIN_SECRET || "qr";
  const visitor = createHash("sha256").update(`${secret}:${info.ip}`).digest("hex").slice(0, 32);
  db()
    .prepare("INSERT INTO scans (qr_id, ts, visitor, device, os, browser, country) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(qrId, Date.now(), visitor, info.device, info.os, info.browser, info.country);
}

export type Breakdown = { label: string; count: number }[];

export function getStats(qrId: string) {
  const d = db();
  const since = Date.now() - 29 * 86400000;
  const totals = d
    .prepare("SELECT COUNT(*) AS total, COUNT(DISTINCT visitor) AS unique_visitors, MAX(ts) AS last_scan FROM scans WHERE qr_id = ?")
    .get(qrId) as { total: number; unique_visitors: number; last_scan: number | null };
  const dailyRows = d
    .prepare(
      `SELECT date(ts / 1000, 'unixepoch') AS day, COUNT(*) AS count FROM scans
       WHERE qr_id = ? AND ts >= ? GROUP BY day`,
    )
    .all(qrId, since - 86400000) as { day: string; count: number }[];
  const byDay = new Map(dailyRows.map((r) => [r.day, r.count]));
  const daily: { day: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    daily.push({ day, count: byDay.get(day) ?? 0 });
  }
  const breakdown = (column: "device" | "os" | "browser" | "country"): Breakdown =>
    d
      .prepare(`SELECT ${column} AS label, COUNT(*) AS count FROM scans WHERE qr_id = ? GROUP BY ${column} ORDER BY count DESC LIMIT 8`)
      .all(qrId) as Breakdown;
  return {
    ...totals,
    daily,
    devices: breakdown("device"),
    os: breakdown("os"),
    browsers: breakdown("browser"),
    countries: breakdown("country"),
  };
}

export function userTotals(userId: string) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return db()
    .prepare(
      `SELECT COUNT(*) AS total,
         SUM(CASE WHEN s.ts >= ? THEN 1 ELSE 0 END) AS today,
         SUM(CASE WHEN s.ts >= ? THEN 1 ELSE 0 END) AS last30
       FROM scans s JOIN qr_codes q ON q.id = s.qr_id WHERE q.user_id = ?`,
    )
    .get(today.getTime(), Date.now() - 30 * 86400000, userId) as { total: number; today: number | null; last30: number | null };
}
