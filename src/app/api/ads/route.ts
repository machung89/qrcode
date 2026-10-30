import type { NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getActiveAds } from "@/lib/ads/store";

export const dynamic = "force-dynamic";

/** Quảng cáo đang bật cho 1 ngôn ngữ. Trang công khai là trang tĩnh nên tải quảng cáo qua API này. */
export async function GET(request: NextRequest) {
  const param = request.nextUrl.searchParams.get("locale");
  const units = await getActiveAds(isLocale(param) ? param : defaultLocale);
  return Response.json(units, { headers: { "Cache-Control": "public, max-age=60" } });
}
