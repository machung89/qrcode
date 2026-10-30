import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { endSession } from "@/lib/user-auth";

// POST để không bị đăng xuất qua link/ảnh nhúng từ trang khác
export async function POST(request: NextRequest) {
  await endSession();
  const param = request.nextUrl.searchParams.get("locale");
  const locale = isLocale(param) ? param : defaultLocale;
  return NextResponse.redirect(new URL(`/${locale}`, request.url), 303);
}
