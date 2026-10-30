import "server-only";
import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import path from "path";

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

// google_id có thể trống (tài khoản email/mật khẩu); password_hash trống (tài khoản chỉ dùng Google)
const usersTable = (name: string) => `
CREATE TABLE IF NOT EXISTS ${name} (
  id TEXT PRIMARY KEY,
  google_id TEXT UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  password_hash TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);`;

const SCHEMA = `
${usersTable("users")}

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS qr_codes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('url', 'pdf')),
  target_url TEXT,
  file_id TEXT REFERENCES files(id) ON DELETE SET NULL,
  design TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS qr_codes_user ON qr_codes(user_id);

CREATE TABLE IF NOT EXISTS scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  qr_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  ts INTEGER NOT NULL,
  visitor TEXT NOT NULL,
  device TEXT NOT NULL,
  os TEXT NOT NULL,
  browser TEXT NOT NULL,
  country TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS scans_qr_ts ON scans(qr_id, ts);
`;

function open() {
  mkdirSync(UPLOAD_DIR, { recursive: true });
  const db = new Database(path.join(DATA_DIR, "app.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.exec(SCHEMA);
  migrate(db);
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS users_email ON users(email COLLATE NOCASE)");
  return db;
}

/** Nâng cấp CSDL tạo bởi phiên bản cũ (bảng users chỉ có đăng nhập Google). */
function migrate(db: Database.Database) {
  const columns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  if (columns.some((c) => c.name === "password_hash")) return;
  // SQLite không đổi được ràng buộc NOT NULL: tạo bảng mới rồi chép dữ liệu.
  // Tắt khoá ngoại để DROP TABLE không xoá dây chuyền phiên/mã QR.
  db.pragma("foreign_keys = OFF");
  db.transaction(() => {
    db.exec(usersTable("users_new"));
    db.exec(
      `INSERT INTO users_new (id, google_id, email, name, avatar, email_verified, created_at)
       SELECT id, google_id, lower(email), name, avatar, 1, created_at FROM users`,
    );
    db.exec("DROP TABLE users");
    db.exec("ALTER TABLE users_new RENAME TO users");
  })();
  db.pragma("foreign_keys = ON");
}

// Giữ 1 kết nối duy nhất, kể cả khi dev server hot-reload
const g = globalThis as unknown as { __db?: Database.Database };
export function db() {
  g.__db ??= open();
  return g.__db;
}
