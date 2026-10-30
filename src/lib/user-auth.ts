import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Locale } from "@/i18n/config";
import { db } from "./db";
import { siteUrl } from "./site";

export const USER_COOKIE = "qr_session";
const SESSION_DAYS = 30;

export type User = { id: string; email: string; name: string; avatar: string };

export const newId = (bytes = 12) => randomBytes(bytes).toString("base64url");
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge,
});

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Tạo hoặc cập nhật người dùng từ hồ sơ Google, trả về id. */
export function upsertGoogleUser(profile: { sub: string; email: string; name?: string; picture?: string }) {
  const d = db();
  const email = normalizeEmail(profile.email);
  const byGoogle = d.prepare("SELECT id FROM users WHERE google_id = ?").get(profile.sub) as { id: string } | undefined;
  if (byGoogle) {
    // Không đổi email nếu email mới đã thuộc tài khoản khác
    const clash = d.prepare("SELECT id FROM users WHERE email = ? COLLATE NOCASE AND id != ?").get(email, byGoogle.id);
    d.prepare("UPDATE users SET email = CASE WHEN ? THEN email ELSE ? END, name = ?, avatar = ? WHERE id = ?").run(
      clash ? 1 : 0,
      email,
      profile.name ?? "",
      profile.picture ?? "",
      byGoogle.id,
    );
    return byGoogle.id;
  }

  // Đã có tài khoản email/mật khẩu cùng email -> liên kết với Google
  const byEmail = d.prepare("SELECT id, email_verified, name FROM users WHERE email = ? COLLATE NOCASE").get(email) as
    | { id: string; email_verified: number; name: string }
    | undefined;
  if (byEmail) {
    d.transaction(() => {
      if (!byEmail.email_verified) {
        // Email chưa từng được xác minh: có thể ai đó đã đăng ký trước bằng email của người khác.
        // Vô hiệu mật khẩu và đăng xuất mọi phiên cũ để chủ thật của email nắm quyền.
        d.prepare("UPDATE users SET password_hash = NULL WHERE id = ?").run(byEmail.id);
        d.prepare("DELETE FROM sessions WHERE user_id = ?").run(byEmail.id);
      }
      d.prepare("UPDATE users SET google_id = ?, email_verified = 1, avatar = ?, name = CASE WHEN name = '' THEN ? ELSE name END WHERE id = ?").run(
        profile.sub,
        profile.picture ?? "",
        profile.name ?? "",
        byEmail.id,
      );
    })();
    return byEmail.id;
  }

  const id = newId();
  d.prepare("INSERT INTO users (id, google_id, email, name, avatar, email_verified, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)").run(
    id,
    profile.sub,
    email,
    profile.name ?? "",
    profile.picture ?? "",
    Date.now(),
  );
  return id;
}

// ---------- Email + mật khẩu ----------

export type AuthErrorCode =
  | "nameRequired"
  | "invalidEmail"
  | "weakPassword"
  | "passwordMismatch"
  | "agreeRequired"
  | "emailTaken"
  | "invalidCredentials"
  | "googleOnly"
  | "tooManyAttempts";

export class AuthError extends Error {
  constructor(public code: AuthErrorCode) {
    super(code);
  }
}

const scryptAsync = (password: string, salt: Buffer, keylen: number, opts: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) => scrypt(password, salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key))));

const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algo, N, r, p, salt, key] = stored.split("$");
  if (algo !== "scrypt") return false;
  const expected = Buffer.from(key, "base64");
  const actual = await scryptAsync(password, Buffer.from(salt, "base64"), expected.length, { N: +N, r: +r, p: +p, maxmem: SCRYPT.maxmem });
  return timingSafeEqual(actual, expected);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Băm sẵn để thời gian phản hồi giống nhau khi email không tồn tại (chống dò email)
const dummyHash = hashPassword("dummy-password-for-timing");

export async function registerWithPassword(input: { name: string; email: string; password: string; confirm: string; agree: boolean }) {
  const name = input.name.trim().slice(0, 80);
  const email = normalizeEmail(input.email);
  if (!name) throw new AuthError("nameRequired");
  if (email.length > 254 || !EMAIL_RE.test(email)) throw new AuthError("invalidEmail");
  if (input.password.length < 8 || input.password.length > 128) throw new AuthError("weakPassword");
  if (input.password !== input.confirm) throw new AuthError("passwordMismatch");
  if (!input.agree) throw new AuthError("agreeRequired");
  if (db().prepare("SELECT 1 FROM users WHERE email = ? COLLATE NOCASE").get(email)) throw new AuthError("emailTaken");

  const id = newId();
  const hash = await hashPassword(input.password);
  try {
    db().prepare("INSERT INTO users (id, email, name, password_hash, email_verified, created_at) VALUES (?, ?, ?, ?, 0, ?)").run(id, email, name, hash, Date.now());
  } catch {
    throw new AuthError("emailTaken"); // 2 yêu cầu đăng ký cùng lúc
  }
  return id;
}

// Giới hạn đăng nhập sai: 8 lần / 15 phút cho mỗi IP + email, 30 lần cho mỗi IP
const failures = new Map<string, number[]>();
const WINDOW = 15 * 60 * 1000;
function recentFailures(key: string) {
  const now = Date.now();
  const list = (failures.get(key) ?? []).filter((t) => now - t < WINDOW);
  failures.set(key, list);
  return list;
}

export async function loginWithPassword(emailInput: string, password: string, ip: string) {
  const email = normalizeEmail(emailInput);
  const keys = [`ip:${ip}`, `pair:${ip}|${email}`];
  if (recentFailures(keys[0]).length >= 30 || recentFailures(keys[1]).length >= 8) throw new AuthError("tooManyAttempts");

  const user = db().prepare("SELECT id, password_hash, google_id FROM users WHERE email = ? COLLATE NOCASE").get(email) as
    | { id: string; password_hash: string | null; google_id: string | null }
    | undefined;
  const valid = user?.password_hash ? await verifyPassword(password, user.password_hash) : (await verifyPassword(password, await dummyHash), false);
  if (!valid) {
    for (const k of keys) recentFailures(k).push(Date.now());
    if (user && !user.password_hash && user.google_id) throw new AuthError("googleOnly");
    throw new AuthError("invalidCredentials");
  }
  failures.delete(keys[1]);
  return user!.id;
}

export async function startSession(userId: string) {
  const token = newId(32);
  const maxAge = SESSION_DAYS * 86400;
  db().prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(hash(token), userId, Date.now() + maxAge * 1000);
  // Dọn phiên hết hạn
  db().prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  (await cookies()).set(USER_COOKIE, token, cookieOptions(maxAge));
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(USER_COOKIE)?.value;
  if (token) db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hash(token));
  store.delete(USER_COOKIE);
}

/** Người dùng hiện tại (cache trong 1 request). */
export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(USER_COOKIE)?.value;
  if (!token) return null;
  const row = db()
    .prepare(
      `SELECT u.id, u.email, u.name, u.avatar FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(hash(token), Date.now()) as User | undefined;
  return row ?? null;
});

export async function requireUser(locale: Locale): Promise<User> {
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  return user;
}

// ---------- Google OAuth 2.0 (Authorization Code + PKCE) ----------

export const OAUTH_COOKIE = "qr_oauth";
export const googleConfigured = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
export const googleRedirectUri = () => `${siteUrl}/api/auth/google/callback`;

export async function googleAuthUrl(locale: Locale) {
  const state = newId(16);
  const verifier = newId(32);
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  (await cookies()).set(OAUTH_COOKIE, JSON.stringify({ state, verifier, locale }), cookieOptions(600));
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/** Đổi mã xác thực lấy hồ sơ người dùng Google. */
export async function googleProfile(code: string, verifier: string) {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });
  if (!tokenRes.ok) throw new Error(`Google token error ${tokenRes.status}`);
  const { access_token } = (await tokenRes.json()) as { access_token: string };
  const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${access_token}` } });
  if (!infoRes.ok) throw new Error(`Google userinfo error ${infoRes.status}`);
  const info = (await infoRes.json()) as { sub: string; email: string; email_verified?: boolean; name?: string; picture?: string };
  if (!info.sub || !info.email || info.email_verified === false) throw new Error("Google account has no verified email");
  return info;
}
