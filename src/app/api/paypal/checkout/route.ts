import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { PaypalError, startCheckout } from "@/lib/billing";
import { isPaidPlan, isPeriod } from "@/lib/plans";
import { siteName } from "@/lib/site";
import { getUser } from "@/lib/user-auth";

/**
 * Form "Mua gói" gửi POST tới đây: tạo đơn PayPal rồi chuyển khách sang PayPal để duyệt.
 * Cookie phiên là SameSite=Lax nên trang khác không thể gửi form thay người dùng.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const localeParam = String(form.get("locale") ?? "");
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const plan = form.get("plan");
  const period = form.get("period");
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url), 303);

  const user = await getUser();
  if (!user) return to(`/${locale}/login`);
  if (!isPaidPlan(plan) || !isPeriod(period)) return to(`/${locale}/dashboard/billing?error=checkout`);

  try {
    const approveUrl = await startCheckout({
      userId: user.id,
      plan,
      period,
      brand: siteName,
      locale,
      returnUrl: new URL(`/api/paypal/return?locale=${locale}`, request.url).toString(),
      cancelUrl: new URL(`/${locale}/dashboard/billing?canceled=1`, request.url).toString(),
    });
    return NextResponse.redirect(approveUrl, 303);
  } catch (e) {
    console.error("PayPal checkout failed:", e instanceof PaypalError ? e.message : e);
    return to(`/${locale}/dashboard/billing?error=checkout`);
  }
}
