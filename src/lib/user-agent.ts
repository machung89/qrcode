/** Phân tích User-Agent đơn giản, đủ cho thống kê lượt quét. */
export function parseUserAgent(ua: string) {
  const s = ua || "";
  const bot = /bot|crawler|spider|crawling|preview|facebookexternalhit|slurp|headless|whatsapp|telegram|discord|skype/i.test(s);

  const os = /windows phone/i.test(s)
    ? "Windows Phone"
    : /android/i.test(s)
      ? "Android"
      : /iphone|ipad|ipod/i.test(s)
        ? "iOS"
        : /mac os x|macintosh/i.test(s)
          ? "macOS"
          : /windows/i.test(s)
            ? "Windows"
            : /cros/i.test(s)
              ? "ChromeOS"
              : /linux/i.test(s)
                ? "Linux"
                : "Other";

  const device = /ipad|tablet|(android(?!.*mobile))/i.test(s) ? "Tablet" : /mobi|iphone|ipod|android/i.test(s) ? "Mobile" : "Desktop";

  const browser = /zalo/i.test(s)
    ? "Zalo"
    : /fban|fbav|instagram/i.test(s)
      ? "Facebook/Instagram"
      : /edg\//i.test(s)
        ? "Edge"
        : /opr\/|opera/i.test(s)
          ? "Opera"
          : /samsungbrowser/i.test(s)
            ? "Samsung Internet"
            : /coc_coc|coccoc/i.test(s)
              ? "Cốc Cốc"
              : /firefox|fxios/i.test(s)
                ? "Firefox"
                : /chrome|crios/i.test(s)
                  ? "Chrome"
                  : /safari/i.test(s)
                    ? "Safari"
                    : "Other";

  return { bot, os, device, browser };
}
