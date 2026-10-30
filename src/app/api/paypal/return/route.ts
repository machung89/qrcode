import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { completeCheckout, PaypalError } from "@/lib/billing";
import { getUser } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

/** PayPal chuyển khách về đây sau khi duyệt (?token=<mã đơn>): thu tiền rồi nâng gói. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const localeParam = params.get("locale");
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const to = (query: string) => NextResponse.redirect(new URL(`/${locale}/dashboard/billing?${query}`, request.url), 303);

  const orderId = params.get("token");
  const user = await getUser();
  if (!user) return NextResponse.redirect(new URL(`/${locale}/login`, request.url), 303);
  if (!orderId) return to("error=payment");

  try {
    await completeCheckout(user.id, orderId);
    return to("paid=1");
  } catch (e) {
    console.error("PayPal capture failed:", e instanceof PaypalError ? e.message : e);
    return to("error=payment");
  }
}
