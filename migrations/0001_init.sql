-- Cấu trúc CSDL D1. Áp dụng bằng: npm run db:migrate:remote (production) / npm run db:migrate:local (máy dev)

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  google_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  -- Gói dịch vụ (free / personal / business) và hạn dùng (ms); hết hạn thì coi như free
  plan TEXT NOT NULL DEFAULT 'free',
  plan_expires_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);

CREATE TABLE files (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE qr_codes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('url', 'pdf')),
  target_url TEXT,
  file_id TEXT REFERENCES files(id) ON DELETE SET NULL,
  design TEXT,
  -- Loại mã (url, pdf, text, wifi, vcard...); kind chỉ còn phân biệt có file PDF ('pdf') hay không ('url')
  qr_type TEXT,
  -- Nội dung JSON theo loại (vd {"ssid":"...","password":"..."})
  content TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX qr_codes_user ON qr_codes(user_id);

CREATE TABLE scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  qr_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  ts INTEGER NOT NULL,
  visitor TEXT NOT NULL,
  device TEXT NOT NULL,
  os TEXT NOT NULL,
  browser TEXT NOT NULL,
  country TEXT NOT NULL
);
CREATE INDEX scans_qr_ts ON scans(qr_id, ts);

-- Giao dịch thanh toán (PayPal). status: created -> completed / failed
CREATE TABLE payments (
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
);
CREATE INDEX payments_user ON payments(user_id, created_at);

-- Cấu hình chung dạng key/value (vd: key 'ads' chứa JSON cấu hình quảng cáo + ads.txt)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Ticket hỗ trợ. status: open (chờ admin) -> answered (admin đã trả lời) -> closed
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  user_unread INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX tickets_user ON tickets(user_id, updated_at);
CREATE INDEX tickets_status ON tickets(status, updated_at);

-- Tin nhắn trong ticket. author: user | admin
CREATE TABLE ticket_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX ticket_messages_ticket ON ticket_messages(ticket_id, created_at);
