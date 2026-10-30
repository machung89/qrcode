// Chạy ở Edge runtime: Cloudflare (OpenNext) hỗ trợ middleware Edge, chưa hỗ trợ proxy.ts (Node runtime) của Next 16
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";

function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;

  const header = request.headers.get("accept-language") ?? "";
  const preferred = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferred) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}

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
