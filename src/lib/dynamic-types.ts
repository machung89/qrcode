// Các loại mã QR động. Dùng được ở cả server và trình duyệt.
import { appIds, appStoreUrl, buildQrData, cryptoCoins, playStoreUrl, socialPlatforms, typeFields, type FieldValues, type QrType } from "./qr-types";

export type DynamicType = QrType | "pdf";

// Không có "bank": app ngân hàng chỉ đọc mã VietQR gốc, không đọc được link chuyển hướng của mã động
export const dynamicTypes: DynamicType[] = [
  "url", "pdf", "text", "email", "phone", "sms", "wifi", "vcard", "location", "event", "whatsapp", "social", "app", "paypal", "crypto",
];

/** Khi quét: chuyển thẳng tới đích. Các loại còn lại mở trang hiển thị /{ngôn ngữ}/q/{mã}. */
export const redirectTypes: DynamicType[] = ["url", "pdf", "location", "whatsapp", "social", "paypal", "app"];

export function isDynamicType(value: unknown): value is DynamicType {
  return typeof value === "string" && (dynamicTypes as string[]).includes(value);
}

/** Tiền tố tên ô nhập trong form; server action đọc lại các khoá "f_*". */
export const FIELD_PREFIX = "f_";

/** Đọc các ô "f_*" từ FormData (ô checkbox không tick thì không có trong form). */
export function readFields(formData: FormData): FieldValues | undefined {
  const out: FieldValues = {};
  let found = false;
  for (const [key, value] of formData.entries()) {
    if (key.startsWith(FIELD_PREFIX) && typeof value === "string") {
      out[key.slice(FIELD_PREFIX.length)] = value;
      found = true;
    }
  }
  return found ? out : undefined;
}

export type ContentError = "required" | "invalidUrl" | "invalidValue";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_LEN: Record<string, number> = { text: 4000, body: 4000, message: 2000, note: 2000, description: 4000 };

/**
 * Chuẩn hoá và kiểm tra nội dung theo loại mã (bỏ loại url/pdf vì xử lý riêng).
 * Trả về nội dung sạch hoặc mã lỗi.
 */
export function validateContent(type: QrType, input: FieldValues): { content: FieldValues } | { error: ContentError } {
  const content: FieldValues = {};
  for (const f of typeFields[type]) {
    let value = String(input[f.name] ?? "");
    value = f.kind === "textarea" ? value.replace(/\r\n/g, "\n") : value.trim();
    value = value.slice(0, MAX_LEN[f.name] ?? 300);
    if (f.kind === "checkbox") value = value === "true" || value === "on" ? "true" : "";
    if (f.kind === "select" && !f.options?.some((o) => o.value === value)) value = f.options?.[0]?.value ?? "";
    if (f.required && !value.trim()) return { error: "required" };
    if (value) content[f.name] = value;
  }
  if (content.email && !EMAIL_RE.test(content.email)) return { error: "invalidValue" };
  if (type === "location") {
    const lat = Number(content.lat);
    const lng = Number(content.lng);
    if (!(Math.abs(lat) <= 90 && Math.abs(lng) <= 180)) return { error: "invalidValue" };
  }
  if ((type === "phone" || type === "sms" || type === "whatsapp") && !/\d{3,}/.test((content.phone ?? "").replace(/\D/g, ""))) {
    return { error: "invalidValue" };
  }
  if (type === "event" && content.end && content.end < content.start) return { error: "invalidValue" };
  // Không dựng được nội dung mã (tên PayPal sai, địa chỉ ví sai, không có mã ứng dụng...) -> giá trị không hợp lệ
  if ((type === "social" || type === "app" || type === "paypal" || type === "crypto" || type === "bank") && !buildQrData(type, content)) {
    return { error: type === "app" && !content.ios && !content.android ? "required" : "invalidValue" };
  }
  if (content.website && !/^https?:\/\//i.test(content.website)) content.website = `https://${content.website}`;
  return { content };
}

/** Đích chuyển hướng cho location / whatsapp / social / paypal (app: xem appStoreTarget). */
export function redirectTarget(type: QrType, content: FieldValues) {
  return buildQrData(type, content) || null;
}

/** Mã ứng dụng: iPhone/iPad -> App Store, Android -> Google Play; null nếu không chọn được (máy tính). */
export function appStoreTarget(userAgent: string, ios: string | null, android: string | null) {
  const isIos = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  if (isIos && ios) return appStoreUrl(ios);
  if (isAndroid && android) return playStoreUrl(android);
  // Điện thoại nhưng chỉ có cửa hàng của hệ kia: vẫn mở cửa hàng đó (vd link web của App Store)
  if (isIos || isAndroid) return ios ? appStoreUrl(ios) : android ? playStoreUrl(android) : null;
  return null;
}

export { appIds };

/** Mô tả ngắn hiển thị trong danh sách mã. */
export function summarize(type: DynamicType, content: FieldValues | null, extra: { url?: string | null; fileName?: string | null }) {
  const c = content ?? {};
  switch (type) {
    case "url":
      return extra.url ?? "";
    case "pdf":
      return extra.fileName ?? "";
    case "text":
      return c.text?.slice(0, 80) ?? "";
    case "email":
      return c.email ?? "";
    case "phone":
    case "sms":
    case "whatsapp":
      return c.phone ?? "";
    case "wifi":
      return c.ssid ?? "";
    case "vcard":
      return [c.firstName, c.lastName].filter(Boolean).join(" ") || c.organization || "";
    case "location":
      return c.lat && c.lng ? `${c.lat}, ${c.lng}` : "";
    case "event":
      return [c.title, c.start?.replace("T", " ")].filter(Boolean).join(" · ");
    case "social":
      return [socialPlatforms.find((p) => p.id === c.platform)?.name, c.username].filter(Boolean).join(" · ");
    case "app": {
      const ids = appIds(c);
      return [ids.ios && "App Store", ids.android && "Google Play"].filter(Boolean).join(" + ");
    }
    case "paypal":
      return [c.username, c.amount && `${c.amount} ${c.currency ?? ""}`.trim()].filter(Boolean).join(" · ");
    case "crypto":
      return [cryptoCoins.find((x) => x.id === c.coin)?.name, c.address && `${c.address.slice(0, 8)}…${c.address.slice(-6)}`].filter(Boolean).join(" · ");
    case "bank":
      return c.account ?? "";
  }
}

export function parseContent(json: string | null): FieldValues | null {
  if (!json) return null;
  try {
    const value = JSON.parse(json);
    return value && typeof value === "object" ? (value as FieldValues) : null;
  } catch {
    return null;
  }
}
