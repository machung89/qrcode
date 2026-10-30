import { type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { contentOf, findBySlug, recordScan, typeOf } from "@/lib/dynamic-qr";
import { redirectTarget } from "@/lib/dynamic-types";
import { parseUserAgent } from "@/lib/user-agent";

export const dynamic = "force-dynamic";

/** Ngôn ngữ ưu tiên đầu tiên của trình duyệt mà website hỗ trợ. */
function requestLocale(request: NextRequest) {
  for (const part of (request.headers.get("accept-language") ?? "").split(",")) {
    const base = part.trim().slice(0, 2).toLowerCase();
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}

function messagePage(request: NextRequest, kind: "paused" | "missing", status: number) {
  const locale = requestLocale(request);
  const t = getDictionary(locale).dashboard.scanPage[kind];
  const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${t.title}</title>
<style>body{font-family:system-ui,sans-serif;background:#f6f8fc;color:#0f172a;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px;text-align:center}div{max-width:420px}h1{font-size:22px}p{color:#475569}a{color:#2753e6}</style></head>
<body><div><h1>${t.title}</h1><p>${t.text}</p><p><a href="/${locale}">${getDictionary(locale).nav.generator}</a></p></div></body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest, { params }: RouteContext<"/r/[slug]">) {
  const { slug } = await params;
  const qr = await findBySlug(slug);
  if (!qr) return messagePage(request, "missing", 404);
  if (!qr.active) return messagePage(request, "paused", 410);

  const ua = parseUserAgent(request.headers.get("user-agent") ?? "");
  if (!ua.bot && request.method === "GET") {
    const ip =
      request.headers.get("cf-connecting-ip") || (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
    // Quốc gia lấy từ header của CDN (Cloudflare / Vercel) nếu có
    const country = (request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country") || "").toUpperCase();
    await recordScan(qr.id, { ip, device: ua.device, os: ua.os, browser: ua.browser, country: /^[A-Z]{2}$/.test(country) && country !== "XX" ? country : "Unknown" });
  }

  const type = typeOf(qr);
  let target: string | null;
  if (type === "url") target = qr.target_url;
  else if (type === "pdf") target = qr.file_id ? new URL(`/f/${qr.file_id}`, request.url).toString() : null;
  else if (type === "location" || type === "whatsapp") target = redirectTarget(type, contentOf(qr) ?? {});
  // Văn bản, WiFi, vCard, email, điện thoại, SMS, sự kiện: mở trang hiển thị theo ngôn ngữ người quét
  else target = new URL(`/${requestLocale(request)}/q/${qr.slug}`, request.url).toString();
  if (!target) return messagePage(request, "missing", 404);
  return new Response(null, { status: 302, headers: { Location: target, "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
