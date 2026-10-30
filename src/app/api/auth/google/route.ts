import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { googleAuthUrl, googleConfigured } from "@/lib/user-auth";

export async function GET(request: NextRequest) {
  const param = request.nextUrl.searchParams.get("locale");
  const locale = isLocale(param) ? param : defaultLocale;
  if (!googleConfigured()) return NextResponse.redirect(new URL(`/${locale}/login?error=config`, request.url));
  return NextResponse.redirect(await googleAuthUrl(locale));
}
