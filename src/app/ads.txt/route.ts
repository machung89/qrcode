import { readAdsConfig } from "@/lib/ads/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const { adsTxt } = await readAdsConfig();
  return new Response(adsTxt.trim() ? `${adsTxt.trim()}\n` : "", {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
