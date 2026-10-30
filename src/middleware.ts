// Chạy ở Edge runtime: Cloudflare (OpenNext) hỗ trợ middleware Edge, chưa hỗ trợ proxy.ts (Node runtime) của Next 16
import { NextResponse, type NextRequest } from "next/server";
import { isLocale } from "@/i18n/config";
import { detectLocale } from "@/i18n/detect";

export function middleware(request: NextRequest) {
  // www.ten-mien -> ten-mien (301) để Google chỉ thấy một phiên bản của website
  const host = request.headers.get("host") ?? "";
  if (host.startsWith("www.")) {
    const url = new URL(request.url);
    url.hostname = host.slice(4).split(":")[0];
    return NextResponse.redirect(url, 301);
  }

  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];
  if (isLocale(first)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${detectLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Bỏ qua admin, api, link QR động (/r/), file PDF (/f/), file tĩnh và các file có phần mở rộng (ads.txt, robots.txt...)
  matcher: ["/((?!admin|api|_next|r/|f/|.*\\..*).*)"],
};
