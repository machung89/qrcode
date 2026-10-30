import "server-only";
import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Locale } from "@/i18n/config";
import { db } from "./db";
import { siteUrl } from "./site";

export const USER_COOKIE = "qr_session";
/** Cookie đánh dấu (không bí mật, JS đọc được) để trình duyệt biết có cần gọi /api/auth/me hay không. */
export const LOGGED_IN_COOKIE = "qr_li";
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

/** Tạo hoặc cập nhật người dùng từ hồ sơ Google, trả về id. Lần đăng nhập đầu tiên chính là đăng ký. */
export async function upsertGoogleUser(profile: { sub: string; email: string; name?: string; picture?: string }) {
  const d = await db();
  const email = profile.email.trim().toLowerCase();
  const existing = await d.prepare("SELECT id FROM users WHERE google_id = ?").bind(profile.sub).first<{ id: string }>();
  if (existing) {
    await d
      .prepare("UPDATE users SET email = ?, name = ?, avatar = ? WHERE id = ?")
      .bind(email, profile.name ?? "", profile.picture ?? "", existing.id)
      .run();
    return existing.id;
  }
  const id = newId();
  await d
    .prepare("INSERT INTO users (id, google_id, email, name, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, profile.sub, email, profile.name ?? "", profile.picture ?? "", Date.now())
    .run();
  return id;
}

export async function startSession(userId: string) {
  const token = newId(32);
  const maxAge = SESSION_DAYS * 86400;
  const d = await db();
  await d.batch([
    d.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").bind(hash(token), userId, Date.now() + maxAge * 1000),
    // Dọn phiên hết hạn
    d.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(Date.now()),
  ]);
  const store = await cookies();
  store.set(USER_COOKIE, token, cookieOptions(maxAge));
  store.set(LOGGED_IN_COOKIE, "1", { ...cookieOptions(maxAge), httpOnly: false });
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(USER_COOKIE)?.value;
  if (token) await (await db()).prepare("DELETE FROM sessions WHERE token_hash = ?").bind(hash(token)).run();
  store.delete(USER_COOKIE);
  store.delete(LOGGED_IN_COOKIE);
}

/** Người dùng hiện tại (cache trong 1 request). */
export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(USER_COOKIE)?.value;
  if (!token) return null;
  return (await db())
    .prepare(
      `SELECT u.id, u.email, u.name, u.avatar FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .bind(hash(token), Date.now())
    .first<User>();
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
