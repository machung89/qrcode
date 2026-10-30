// Logo có sẵn để chèn giữa mã QR. Biểu tượng thương hiệu lấy từ Simple Icons (CC0).
// Tải động khi mở tab Logo để không làm nặng trang tạo mã.
import {
  siAppstore,
  siBitcoin,
  siDiscord,
  siEthereum,
  siFacebook,
  siGithub,
  siGmail,
  siGooglemaps,
  siGoogleplay,
  siGrab,
  siInstagram,
  siKakaotalk,
  siLine,
  siMessenger,
  siPaypal,
  siPinterest,
  siShopee,
  siSnapchat,
  siSpotify,
  siTelegram,
  siThreads,
  siTiktok,
  siViber,
  siWechat,
  siWhatsapp,
  siX,
  siYoutube,
  siZalo,
  siZoom,
} from "simple-icons";

export type LogoPreset = { id: string; name: string; src: string };

type Icon = { title: string; hex: string; path: string };

const toDataUrl = (svg: string) => `data:image/svg+xml;base64,${btoa(svg)}`;

/** Chữ trắng hay đen tuỳ độ sáng nền (vd Snapchat, KakaoTalk nền vàng -> chữ đen) */
function glyphColor(hex: string) {
  const n = parseInt(hex, 16);
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.7 ? "#111" : "#fff";
}

/** Ô vuông bo góc màu thương hiệu, biểu tượng ở giữa (width/height để vẽ được lên canvas khi xuất PNG) */
function tile(inner: string, background: string, defs = "") {
  // Nền trắng: thêm viền xám nhạt để logo tách khỏi các ô của mã QR
  const border = background === "#fff" ? ' stroke="#e2e8f0" stroke-width="0.6"' : "";
  return toDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24">${defs}<rect x="0.3" y="0.3" width="23.4" height="23.4" rx="5.5" fill="${background}"${border}/><g transform="translate(5 5) scale(0.5833)">${inner}</g></svg>`,
  );
}

/** Mặc định: nền màu thương hiệu, biểu tượng trắng/đen. background "#fff": nền trắng, biểu tượng màu thương hiệu (Gmail, Google Maps). */
function brand(icon: Icon, id: string, background = `#${icon.hex}`) {
  const fill = background === "#fff" ? `#${icon.hex}` : glyphColor(icon.hex);
  return { id, name: icon.title, src: tile(`<path fill="${fill}" d="${icon.path}"/>`, background) };
}

// Biểu tượng nét (giống TypeIcon) cho các loại mã không thuộc thương hiệu nào
function generic(id: string, name: string, paths: string, background = "#2753e6") {
  return {
    id,
    name,
    src: tile(`<g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</g>`, background),
  };
}

const instagramGradient =
  '<defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FEDA75"/><stop offset=".3" stop-color="#FA7E1E"/><stop offset=".6" stop-color="#D62976"/><stop offset="1" stop-color="#4F5BD5"/></linearGradient></defs>';

export const logoPresets: LogoPreset[] = [
  brand(siFacebook, "facebook"),
  { id: "instagram", name: "Instagram", src: tile(`<path fill="#fff" d="${siInstagram.path}"/>`, "url(#ig)", instagramGradient) },
  brand(siTiktok, "tiktok"),
  brand(siYoutube, "youtube"),
  brand(siZalo, "zalo"),
  brand(siMessenger, "messenger"),
  brand(siTelegram, "telegram"),
  brand(siWhatsapp, "whatsapp"),
  brand(siX, "x"),
  {
    id: "linkedin",
    name: "LinkedIn",
    src: tile('<text x="12" y="18" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="19" font-weight="700" fill="#fff">in</text>', "#0A66C2"),
  },
  brand(siThreads, "threads"),
  brand(siPinterest, "pinterest"),
  brand(siSnapchat, "snapchat"),
  brand(siGithub, "github"),
  brand(siDiscord, "discord"),
  brand(siViber, "viber"),
  brand(siLine, "line"),
  brand(siWechat, "wechat"),
  brand(siKakaotalk, "kakaotalk"),
  brand(siSpotify, "spotify"),
  brand(siZoom, "zoom"),
  brand(siShopee, "shopee"),
  brand(siGrab, "grab"),
  brand(siGmail, "gmail", "#fff"),
  brand(siGooglemaps, "googlemaps", "#fff"),
  brand(siAppstore, "appstore"),
  brand(siGoogleplay, "googleplay"),
  brand(siPaypal, "paypal"),
  brand(siBitcoin, "bitcoin"),
  brand(siEthereum, "ethereum"),
  generic("wifi", "WiFi", '<path d="M2 9a15 15 0 0 1 20 0"/><path d="M5.5 12.5a10 10 0 0 1 13 0"/><path d="M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="19.5" r="1" fill="#fff"/>'),
  generic("phone", "Phone", '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>', "#16a34a"),
  generic("email", "Email", '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', "#ea580c"),
  generic("sms", "SMS", '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1Z"/><path d="M8 10h8M8 13h5"/>', "#0891b2"),
  generic("location", "Location", '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>', "#dc2626"),
  generic("url", "Link", '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>'),
  generic("vcard", "Contact", '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2.5"/><path d="M5.5 16.5a3.5 3.5 0 0 1 7 0M15 9h3M15 13h3"/>', "#7c3aed"),
  generic("event", "Calendar", '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>', "#db2777"),
  generic("bank", "Bank", '<path d="M3 9.5 12 4l9 5.5M4 20h16M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/>', "#0f766e"),
];

/** Logo gợi ý theo loại mã đang tạo (hiện lên đầu danh sách) */
export function suggestedLogos(type: string, values: Record<string, string>): string[] {
  switch (type) {
    case "social":
      return [values.platform || "facebook"];
    case "app":
      return ["appstore", "googleplay"];
    case "crypto":
      return [values.coin === "ethereum" ? "ethereum" : "bitcoin"];
    case "email":
      return ["email", "gmail"];
    case "location":
      return ["location", "googlemaps"];
    case "whatsapp":
    case "paypal":
    case "wifi":
    case "phone":
    case "sms":
    case "vcard":
    case "event":
    case "bank":
    case "url":
      return [type];
    default:
      return [];
  }
}
