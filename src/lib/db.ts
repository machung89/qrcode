import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Binding của Cloudflare (khai báo trong wrangler.jsonc). Lấy mới mỗi lần gọi:
 * Workers không cho dùng lại kết nối giữa các request.
 * `async: true` để dùng được cả lúc build trang tĩnh lẫn lúc xử lý request.
 */
async function env() {
  return (await getCloudflareContext({ async: true })).env;
}

// Cột thêm sau lần deploy đầu (CSDL mới đã có sẵn trong migrations/0001_init.sql)
const ADDED_COLUMNS = [
  ["qr_codes", "qr_type", "TEXT"],
  ["qr_codes", "content", "TEXT"],
] as const;

// Chỉ nhớ cờ "đã kiểm tra" (không giữ Promise/kết nối giữa các request)
let schemaChecked = false;

async function ensureSchema(d: D1Database) {
  if (schemaChecked) return;
  const { results } = await d.prepare("PRAGMA table_info(qr_codes)").all<{ name: string }>();
  const existing = new Set(results.map((r) => r.name));
  for (const [table, column, type] of ADDED_COLUMNS) {
    if (existing.has(column)) continue;
    // Hai request khởi động cùng lúc có thể cùng thêm cột: bỏ qua lỗi "duplicate column"
    await d
      .prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`)
      .run()
      .catch((e: Error) => {
        if (!/duplicate column/i.test(e.message)) throw e;
      });
  }
  schemaChecked = true;
}

/** CSDL D1: người dùng, phiên, mã QR động, lượt quét, cấu hình. */
export async function db(): Promise<D1Database> {
  const d = (await env()).DB;
  await ensureSchema(d);
  return d;
}

/** Kho R2 chứa file PDF người dùng tải lên. */
export async function filesBucket(): Promise<R2Bucket> {
  return (await env()).FILES;
}
