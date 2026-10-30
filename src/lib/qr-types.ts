import { siteUrl } from "./site";

export const qrTypes = [
  "url",
  "text",
  "email",
  "phone",
  "sms",
  "wifi",
  "vcard",
  "location",
  "event",
  "whatsapp",
  "social",
  "app",
  "bank",
  "paypal",
  "crypto",
] as const;
export type QrType = (typeof qrTypes)[number];

export function isQrType(value: string): value is QrType {
  return (qrTypes as readonly string[]).includes(value);
}

/** Khóa nhãn trong dictionary.fields */
export type FieldLabel =
  | "url" | "text" | "email" | "subject" | "message" | "phone" | "ssid" | "password"
  | "encryption" | "hidden" | "none" | "firstName" | "lastName" | "organization" | "jobTitle"
  | "mobile" | "workPhone" | "website" | "street" | "city" | "zip" | "country" | "note"
  | "latitude" | "longitude" | "eventTitle" | "location" | "start" | "end" | "description"
  | "platform" | "username" | "appStore" | "googlePlay" | "appHint" | "bank" | "accountNumber" | "amount"
  | "transferNote" | "transferNoteHint" | "currency" | "coin" | "walletAddress";

export type FieldDef = {
  name: string;
  label: FieldLabel;
  kind: "text" | "url" | "email" | "tel" | "textarea" | "select" | "checkbox" | "number" | "datetime-local" | "password";
  required?: boolean;
  placeholder?: string;
  half?: boolean;
  options?: { value: string; label: FieldLabel | string }[];
  /** Dòng gợi ý dưới ô nhập */
  hint?: FieldLabel;
};

/** Mạng xã hội: tên người dùng -> link hồ sơ */
export const socialPlatforms = [
  { id: "facebook", name: "Facebook", url: (u: string) => `https://www.facebook.com/${u}` },
  { id: "instagram", name: "Instagram", url: (u: string) => `https://www.instagram.com/${u}` },
  { id: "tiktok", name: "TikTok", url: (u: string) => `https://www.tiktok.com/@${u}` },
  { id: "youtube", name: "YouTube", url: (u: string) => `https://www.youtube.com/@${u}` },
  { id: "zalo", name: "Zalo", url: (u: string) => `https://zalo.me/${u.replace(/[^\d]/g, "").replace(/^84/, "0")}` },
  { id: "telegram", name: "Telegram", url: (u: string) => `https://t.me/${u}` },
  { id: "x", name: "X (Twitter)", url: (u: string) => `https://x.com/${u}` },
  { id: "linkedin", name: "LinkedIn", url: (u: string) => `https://www.linkedin.com/in/${u}` },
  { id: "threads", name: "Threads", url: (u: string) => `https://www.threads.net/@${u}` },
  { id: "pinterest", name: "Pinterest", url: (u: string) => `https://www.pinterest.com/${u}` },
  { id: "snapchat", name: "Snapchat", url: (u: string) => `https://www.snapchat.com/add/${u}` },
  { id: "github", name: "GitHub", url: (u: string) => `https://github.com/${u}` },
] as const;

/** Ngân hàng Việt Nam hỗ trợ VietQR (mã BIN của NAPAS) */
export const vietBanks = [
  { bin: "970436", name: "Vietcombank" },
  { bin: "970415", name: "VietinBank" },
  { bin: "970418", name: "BIDV" },
  { bin: "970405", name: "Agribank" },
  { bin: "970407", name: "Techcombank" },
  { bin: "970422", name: "MB Bank" },
  { bin: "970416", name: "ACB" },
  { bin: "970432", name: "VPBank" },
  { bin: "970423", name: "TPBank" },
  { bin: "970403", name: "Sacombank" },
  { bin: "970437", name: "HDBank" },
  { bin: "970441", name: "VIB" },
  { bin: "970443", name: "SHB" },
  { bin: "970431", name: "Eximbank" },
  { bin: "970426", name: "MSB" },
  { bin: "970448", name: "OCB" },
  { bin: "970440", name: "SeABank" },
  { bin: "970449", name: "LPBank" },
  { bin: "970428", name: "Nam A Bank" },
  { bin: "970409", name: "Bac A Bank" },
  { bin: "970425", name: "ABBANK" },
  { bin: "970454", name: "BVBank (Viet Capital)" },
  { bin: "970452", name: "KienlongBank" },
  { bin: "970412", name: "PVcomBank" },
  { bin: "970427", name: "VietABank" },
  { bin: "970419", name: "NCB" },
  { bin: "970433", name: "Vietbank" },
  { bin: "970438", name: "BaoViet Bank" },
  { bin: "970406", name: "DongA Bank" },
  { bin: "970430", name: "PGBank" },
  { bin: "970400", name: "Saigonbank" },
  { bin: "970424", name: "Shinhan Bank" },
  { bin: "970457", name: "Woori Bank" },
  { bin: "546034", name: "CAKE by VPBank" },
  { bin: "546035", name: "Ubank by VPBank" },
  { bin: "963388", name: "Timo" },
] as const;

/** Ví tiền mã hoá (URI theo BIP21 / EIP-681) */
export const cryptoCoins = [
  { id: "bitcoin", name: "Bitcoin (BTC)" },
  { id: "ethereum", name: "Ethereum (ETH)" },
  { id: "litecoin", name: "Litecoin (LTC)" },
  { id: "dogecoin", name: "Dogecoin (DOGE)" },
  { id: "bitcoincash", name: "Bitcoin Cash (BCH)" },
] as const;

export const typeFields: Record<QrType, FieldDef[]> = {
  url: [{ name: "url", label: "url", kind: "url", required: true, placeholder: "https://example.com" }],
  text: [{ name: "text", label: "text", kind: "textarea", required: true }],
  email: [
    { name: "email", label: "email", kind: "email", required: true, placeholder: "name@example.com" },
    { name: "subject", label: "subject", kind: "text" },
    { name: "body", label: "message", kind: "textarea" },
  ],
  phone: [{ name: "phone", label: "phone", kind: "tel", required: true, placeholder: "+84 912 345 678" }],
  sms: [
    { name: "phone", label: "phone", kind: "tel", required: true, placeholder: "+84 912 345 678" },
    { name: "message", label: "message", kind: "textarea" },
  ],
  wifi: [
    { name: "ssid", label: "ssid", kind: "text", required: true },
    { name: "password", label: "password", kind: "password" },
    {
      name: "encryption",
      label: "encryption",
      kind: "select",
      half: true,
      options: [
        { value: "WPA", label: "WPA/WPA2/WPA3" },
        { value: "WEP", label: "WEP" },
        { value: "nopass", label: "none" },
      ],
    },
    { name: "hidden", label: "hidden", kind: "checkbox", half: true },
  ],
  vcard: [
    { name: "firstName", label: "firstName", kind: "text", required: true, half: true },
    { name: "lastName", label: "lastName", kind: "text", half: true },
    { name: "organization", label: "organization", kind: "text", half: true },
    { name: "jobTitle", label: "jobTitle", kind: "text", half: true },
    { name: "mobile", label: "mobile", kind: "tel", half: true },
    { name: "workPhone", label: "workPhone", kind: "tel", half: true },
    { name: "email", label: "email", kind: "email", half: true },
    { name: "website", label: "website", kind: "url", half: true },
    { name: "street", label: "street", kind: "text" },
    { name: "city", label: "city", kind: "text", half: true },
    { name: "zip", label: "zip", kind: "text", half: true },
    { name: "country", label: "country", kind: "text" },
    { name: "note", label: "note", kind: "textarea" },
  ],
  location: [
    { name: "lat", label: "latitude", kind: "number", required: true, half: true, placeholder: "21.0285" },
    { name: "lng", label: "longitude", kind: "number", required: true, half: true, placeholder: "105.8542" },
  ],
  event: [
    { name: "title", label: "eventTitle", kind: "text", required: true },
    { name: "location", label: "location", kind: "text" },
    { name: "start", label: "start", kind: "datetime-local", required: true, half: true },
    { name: "end", label: "end", kind: "datetime-local", half: true },
    { name: "description", label: "description", kind: "textarea" },
  ],
  whatsapp: [
    { name: "phone", label: "phone", kind: "tel", required: true, placeholder: "+84 912 345 678" },
    { name: "message", label: "message", kind: "textarea" },
  ],
  social: [
    { name: "platform", label: "platform", kind: "select", half: true, options: socialPlatforms.map((p) => ({ value: p.id, label: p.name })) },
    { name: "username", label: "username", kind: "text", required: true, half: true, placeholder: "@username" },
  ],
  app: [
    { name: "ios", label: "appStore", kind: "url", placeholder: "https://apps.apple.com/app/id123456789" },
    { name: "android", label: "googlePlay", kind: "url", placeholder: "https://play.google.com/store/apps/details?id=com.example", hint: "appHint" },
  ],
  bank: [
    { name: "bin", label: "bank", kind: "select", options: vietBanks.map((b) => ({ value: b.bin, label: b.name })) },
    { name: "account", label: "accountNumber", kind: "text", required: true, half: true, placeholder: "0123456789" },
    { name: "amount", label: "amount", kind: "number", half: true, placeholder: "50000" },
    { name: "note", label: "transferNote", kind: "text", placeholder: "THANH TOAN DON 123", hint: "transferNoteHint" },
  ],
  paypal: [
    { name: "username", label: "username", kind: "text", required: true, placeholder: "paypal.me/username" },
    { name: "amount", label: "amount", kind: "number", half: true, placeholder: "10" },
    { name: "currency", label: "currency", kind: "select", half: true, options: ["USD", "EUR", "GBP", "AUD", "CAD", "JPY", "SGD", "HKD"].map((c) => ({ value: c, label: c })) },
  ],
  crypto: [
    { name: "coin", label: "coin", kind: "select", half: true, options: cryptoCoins.map((c) => ({ value: c.id, label: c.name })) },
    { name: "amount", label: "amount", kind: "number", half: true },
    { name: "address", label: "walletAddress", kind: "text", required: true },
  ],
};

export type FieldValues = Record<string, string>;

export function defaultValuesFor(type: QrType): FieldValues {
  const values: FieldValues = {};
  for (const f of typeFields[type]) values[f.name] = f.kind === "select" ? f.options?.[0]?.value ?? "" : "";
  return values;
}

const wifiEscape = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
const vEscape = (s: string) => s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/([,;])/g, "\\$1");
const digits = (s: string) => s.replace(/[^\d+]/g, "");

/** "2026-10-30T09:00" -> "20261030T090000" (giờ địa phương, không có múi giờ) */
function icsDate(value: string) {
  return value.replace(/[-:]/g, "").padEnd(15, "0").slice(0, 15);
}

/** Tạo nội dung chuỗi được mã hoá vào QR. Trả về "" nếu thiếu trường bắt buộc. */
export function buildQrData(type: QrType, v: FieldValues): string {
  const missing = typeFields[type].some((f) => f.required && !v[f.name]?.trim());
  if (missing) return "";

  switch (type) {
    case "url": {
      const url = v.url.trim();
      return /^[a-z][a-z\d+.-]*:/i.test(url) ? url : `https://${url}`;
    }
    case "text":
      return v.text;
    case "email": {
      const params = new URLSearchParams();
      if (v.subject) params.set("subject", v.subject);
      if (v.body) params.set("body", v.body);
      const qs = params.toString().replace(/\+/g, "%20");
      return `mailto:${v.email.trim()}${qs ? `?${qs}` : ""}`;
    }
    case "phone":
      return `tel:${digits(v.phone)}`;
    case "sms":
      return `SMSTO:${digits(v.phone)}:${v.message ?? ""}`;
    case "wifi": {
      const enc = v.encryption || "WPA";
      const pass = enc === "nopass" ? "" : `P:${wifiEscape(v.password ?? "")};`;
      return `WIFI:T:${enc};S:${wifiEscape(v.ssid)};${pass}${v.hidden === "true" ? "H:true;" : ""};`;
    }
    case "vcard": {
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${vEscape(v.lastName ?? "")};${vEscape(v.firstName ?? "")};;;`,
        `FN:${vEscape([v.firstName, v.lastName].filter(Boolean).join(" "))}`,
      ];
      if (v.organization) lines.push(`ORG:${vEscape(v.organization)}`);
      if (v.jobTitle) lines.push(`TITLE:${vEscape(v.jobTitle)}`);
      if (v.mobile) lines.push(`TEL;TYPE=CELL:${digits(v.mobile)}`);
      if (v.workPhone) lines.push(`TEL;TYPE=WORK:${digits(v.workPhone)}`);
      if (v.email) lines.push(`EMAIL:${v.email.trim()}`);
      if (v.website) lines.push(`URL:${v.website.trim()}`);
      if (v.street || v.city || v.zip || v.country)
        lines.push(`ADR:;;${vEscape(v.street ?? "")};${vEscape(v.city ?? "")};;${vEscape(v.zip ?? "")};${vEscape(v.country ?? "")}`);
      if (v.note) lines.push(`NOTE:${vEscape(v.note)}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }
    case "location":
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.lat.trim()},${v.lng.trim()}`)}`;
    case "event": {
      const lines = ["BEGIN:VEVENT", `SUMMARY:${vEscape(v.title)}`, `DTSTART:${icsDate(v.start)}`];
      if (v.end) lines.push(`DTEND:${icsDate(v.end)}`);
      if (v.location) lines.push(`LOCATION:${vEscape(v.location)}`);
      if (v.description) lines.push(`DESCRIPTION:${vEscape(v.description)}`);
      lines.push("END:VEVENT");
      return lines.join("\n");
    }
    case "whatsapp": {
      const num = digits(v.phone).replace(/^\+/, "");
      return `https://wa.me/${num}${v.message ? `?text=${encodeURIComponent(v.message)}` : ""}`;
    }
    case "social":
      return socialUrl(v.platform, v.username);
    case "app": {
      const { ios, android } = appIds(v);
      if (!ios && !android) return "";
      const params = new URLSearchParams();
      if (ios) params.set("i", ios);
      if (android) params.set("a", android);
      return `${siteUrl}/r/app?${params}`;
    }
    case "bank":
      return vietQr(v);
    case "paypal": {
      const user = v.username.trim().replace(/^(https?:\/\/)?(www\.)?paypal\.me\//i, "").replace(/^@/, "").split(/[/?#]/)[0];
      if (!/^[\w-]+$/.test(user)) return "";
      const amount = Number(v.amount);
      return `https://paypal.me/${user}${amount > 0 ? `/${+amount.toFixed(2)}${v.currency || "USD"}` : ""}`;
    }
    case "crypto": {
      const address = v.address.trim();
      if (!/^[a-zA-Z0-9:]{20,120}$/.test(address)) return "";
      const coin = cryptoCoins.some((c) => c.id === v.coin) ? v.coin : "bitcoin";
      const amount = Number(v.amount);
      if (!(amount > 0)) return `${coin}:${address}`;
      // EIP-681: số ETH tính bằng wei, viết dạng số mũ (1.5e18); các coin còn lại theo BIP21
      return coin === "ethereum" ? `ethereum:${address}?value=${amount}e18` : `${coin}:${address}?amount=${amount}`;
    }
  }
}

/** Link hồ sơ mạng xã hội; nhập sẵn cả link thì giữ nguyên link đó. */
export function socialUrl(platform: string, input: string) {
  const value = input.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || /^[\w-]+(\.[\w-]+)+\//.test(value)) return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const p = socialPlatforms.find((x) => x.id === platform) ?? socialPlatforms[0];
  // Zalo dùng số điện thoại: lấy chữ số từ chuỗi gốc (mã hoá URL trước sẽ lẫn "2B", "20" của dấu + và khoảng trắng)
  if (p.id === "zalo") return /\d{6,}/.test(value.replace(/\D/g, "")) ? p.url(value) : "";
  return p.url(encodeURIComponent(value.replace(/^@/, "")));
}

/** Mã ứng dụng từ link hoặc mã nhập vào: iOS "123456789", Android "com.example.app" */
export function appIds(v: FieldValues) {
  const iosIn = (v.ios ?? "").trim();
  const androidIn = (v.android ?? "").trim();
  const ios = iosIn.match(/(?:^|\/id|^id)(\d{6,12})(?:$|[/?#])/)?.[1] ?? null;
  const android = (androidIn.match(/[?&]id=([\w.]+)/)?.[1] ?? androidIn).match(/^[a-zA-Z]\w*(\.\w+)+$/)?.[0] ?? null;
  return { ios, android };
}

export const appStoreUrl = (id: string) => `https://apps.apple.com/app/id${id}`;
export const playStoreUrl = (pkg: string) => `https://play.google.com/store/apps/details?id=${pkg}`;

/** CRC16-CCITT (poly 0x1021, khởi tạo 0xFFFF) theo chuẩn EMVCo */
function crc16(s: string) {
  let crc = 0xffff;
  for (let i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

const tlv = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`;

/** Nội dung chuyển khoản: bỏ dấu tiếng Việt, chỉ giữ chữ, số và khoảng trắng (app ngân hàng đọc ổn định nhất) */
export const transferNote = (s = "") =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, (c) => (c === "đ" ? "d" : "D"))
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50);

/** Mã VietQR (chuẩn EMVCo của NAPAS) để chuyển khoản tới tài khoản ngân hàng Việt Nam */
export function vietQr(v: FieldValues) {
  const bank = vietBanks.find((b) => b.bin === v.bin) ?? vietBanks[0];
  const account = (v.account ?? "").replace(/\s/g, "");
  if (!/^[a-zA-Z0-9]{4,19}$/.test(account)) return "";
  const amount = String(Math.round(Number(v.amount) || 0));
  const note = transferNote(v.note);
  const payload =
    tlv("00", "01") +
    tlv("01", amount !== "0" ? "12" : "11") +
    tlv("38", tlv("00", "A000000727") + tlv("01", tlv("00", bank.bin) + tlv("01", account)) + tlv("02", "QRIBFTTA")) +
    tlv("53", "704") +
    (amount !== "0" ? tlv("54", amount) : "") +
    tlv("58", "VN") +
    (note ? tlv("62", tlv("08", note)) : "") +
    "6304";
  return payload + crc16(payload);
}

/** File danh bạ .vcf (vCard 3.0, xuống dòng CRLF theo chuẩn). */
export function buildVcf(v: FieldValues) {
  return buildQrData("vcard", v).replace(/\n/g, "\r\n") + "\r\n";
}

/** File lịch .ics hoàn chỉnh (VCALENDAR) cho mã QR sự kiện; không có giờ kết thúc thì mặc định 1 tiếng. */
export function buildIcs(v: FieldValues, uid: string) {
  const start = icsDate(v.start);
  const end = v.end ? icsDate(v.end) : icsDate(addHour(v.start));
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//QR Code Generator//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `SUMMARY:${vEscape(v.title)}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
  ];
  if (v.location) lines.push(`LOCATION:${vEscape(v.location)}`);
  if (v.description) lines.push(`DESCRIPTION:${vEscape(v.description)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

/** Link "Thêm vào Google Calendar" cho mã QR sự kiện (giờ địa phương của người xem). */
export function googleCalendarUrl(v: FieldValues) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: v.title,
    dates: `${icsDate(v.start)}/${icsDate(v.end || addHour(v.start))}`,
  });
  if (v.location) params.set("location", v.location);
  if (v.description) params.set("details", v.description);
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** "2026-12-24T19:00" -> "2026-12-24T20:00" (không đổi múi giờ) */
function addHour(value: string) {
  const d = new Date(`${value.slice(0, 16)}:00Z`);
  if (Number.isNaN(d.getTime())) return value;
  return new Date(d.getTime() + 3600_000).toISOString().slice(0, 16);
}
