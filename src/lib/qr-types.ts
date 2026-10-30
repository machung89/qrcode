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
  | "latitude" | "longitude" | "eventTitle" | "location" | "start" | "end" | "description";

export type FieldDef = {
  name: string;
  label: FieldLabel;
  kind: "text" | "url" | "email" | "tel" | "textarea" | "select" | "checkbox" | "number" | "datetime-local" | "password";
  required?: boolean;
  placeholder?: string;
  half?: boolean;
  options?: { value: string; label: FieldLabel | string }[];
};

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
  }
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
