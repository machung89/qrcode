import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { googleProfile, OAUTH_COOKIE, startSession, upsertGoogleUser } from "@/lib/user-auth";

export async function GET(request: NextRequest) {
  const store = await cookies();
  let saved: { state?: string; verifier?: string; locale?: string } = {};
  try {
    saved = JSON.parse(store.get(OAUTH_COOKIE)?.value ?? "{}");
  } catch {}
  store.delete(OAUTH_COOKIE);

  const locale = isLocale(saved.locale) ? saved.locale : defaultLocale;
  const fail = () => NextResponse.redirect(new URL(`/${locale}/login?error=1`, request.url));

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state || !saved.state || state !== saved.state || !saved.verifier) return fail();

  try {
    const profile = await googleProfile(code, saved.verifier);
    await startSession(upsertGoogleUser(profile));
  } catch (e) {
    console.error("Google sign-in failed:", e);
    return fail();
  }
  return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
}
