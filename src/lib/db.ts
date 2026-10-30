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

// Phần thêm sau lần deploy đầu (CSDL mới đã có sẵn trong migrations/0001_init.sql)
const ADDED_COLUMNS = [
  ["qr_codes", "qr_type", "TEXT"],
  ["qr_codes", "content", "TEXT"],
  ["users", "plan", "TEXT NOT NULL DEFAULT 'free'"],
  ["users", "plan_expires_at", "INTEGER"],
] as const;

const ADDED_TABLES = [
  `CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    order_id TEXT UNIQUE,
    plan TEXT NOT NULL,
    period TEXT NOT NULL,
    amount TEXT NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    payer_email TEXT,
    created_at INTEGER NOT NULL,
    completed_at INTEGER
  )`,
  "CREATE INDEX IF NOT EXISTS payments_user ON payments(user_id, created_at)",
];

// Chỉ nhớ cờ "đã kiểm tra" (không giữ Promise/kết nối giữa các request)
let schemaChecked = false;

async function ensureSchema(d: D1Database) {
  if (schemaChecked) return;
  const tables = [...new Set(ADDED_COLUMNS.map(([table]) => table))];
  const existing = new Map<string, Set<string>>();
  for (const table of tables) {
    const { results } = await d.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
    existing.set(table, new Set(results.map((r) => r.name)));
  }
  for (const [table, column, type] of ADDED_COLUMNS) {
    if (existing.get(table)?.has(column)) continue;
    // Hai request khởi động cùng lúc có thể cùng thêm cột: bỏ qua lỗi "duplicate column"
    await d
      .prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`)
      .run()
      .catch((e: Error) => {
        if (!/duplicate column/i.test(e.message)) throw e;
      });
  }
  for (const sql of ADDED_TABLES) await d.prepare(sql).run();
  schemaChecked = true;
}

/** CSDL D1: người dùng, phiên, mã QR động, lượt quét, thanh toán, cấu hình. */
export async function db(): Promise<D1Database> {
  const d = (await env()).DB;
  await ensureSchema(d);
  return d;
}

/** Kho R2 chứa file PDF người dùng tải lên. */
export async function filesBucket(): Promise<R2Bucket> {
  return (await env()).FILES;
}
