import { publicBilling, readBilling } from "@/lib/billing";

export const dynamic = "force-dynamic";

/** Giá các gói (công khai, không chứa Client Secret). Trang Bảng giá là trang tĩnh nên lấy giá qua API này. */
export async function GET() {
  return Response.json(publicBilling(await readBilling()), { headers: { "Cache-Control": "public, max-age=300" } });
}
