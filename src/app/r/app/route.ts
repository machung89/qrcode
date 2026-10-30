import { type NextRequest } from "next/server";
import { detectLocale } from "@/i18n/detect";
import { getDictionary } from "@/i18n/get-dictionary";
import { appStoreTarget } from "@/lib/dynamic-types";
import { appIds, appStoreUrl, playStoreUrl } from "@/lib/qr-types";

// Mã QR tĩnh "tải ứng dụng": /r/app?i={id App Store}&a={gói Google Play}
// iPhone/iPad -> App Store, Android -> Google Play, máy tính -> trang có cả hai nút.
export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const { ios, android } = appIds({ ios: q.get("i") ?? "", android: q.get("a") ?? "" });
  const target = appStoreTarget(request.headers.get("user-agent") ?? "", ios, android);
  if (target) return new Response(null, { status: 302, headers: { Location: target, "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });

  const locale = detectLocale(request);
  const dict = getDictionary(locale);
  const buttons = [ios && `<a href="${esc(appStoreUrl(ios))}">App Store</a>`, android && `<a href="${esc(playStoreUrl(android))}">Google Play</a>`].filter(Boolean).join("");
  const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(dict.types.app.name)}</title>
<style>body{font-family:system-ui,sans-serif;background:#f6f8fc;color:#0f172a;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px;text-align:center}div{max-width:420px;width:100%}h1{font-size:22px}a{display:block;margin:12px 0;padding:14px;border-radius:10px;background:#2753e6;color:#fff;font-weight:600;text-decoration:none}p a{background:none;color:#2753e6;padding:0}</style></head>
<body><div><h1>${esc(dict.types.app.name)}</h1>${buttons || `<p>${esc(dict.dashboard.scanPage.missing.text)}</p>`}<p><a href="/${locale}">${esc(dict.nav.generator)}</a></p></div></body></html>`;
  return new Response(html, { status: buttons ? 200 : 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
