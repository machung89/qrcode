// Chỉ dùng phía trình duyệt: tạo SVG mã QR, ghép khung và xuất ảnh.
import type { CornerDotType, CornerSquareType, DotType, FileExtension, Options } from "qr-code-styling";

export type Design = {
  fg: string;
  fg2: string;
  gradient: boolean;
  bg: string;
  transparent: boolean;
  dots: DotType;
  cornerSquare: CornerSquareType;
  cornerDot: CornerDotType;
  cornerColor: string;
  margin: number;
  ec: "L" | "M" | "Q" | "H";
  logo: string | null;
  logoSize: number;
  hideDots: boolean;
};

export const defaultDesign: Design = {
  fg: "#0f172a",
  fg2: "#2753e6",
  gradient: false,
  bg: "#ffffff",
  transparent: false,
  dots: "square",
  cornerSquare: "square",
  cornerDot: "square",
  cornerColor: "#0f172a",
  margin: 10,
  ec: "M",
  logo: null,
  logoSize: 0.35,
  hideDots: true,
};

export const frameStyles = ["none", "classic", "top", "bubble", "border", "caption"] as const;
export type FrameStyle = (typeof frameStyles)[number];

export type Frame = { style: FrameStyle; text: string; color: string; textColor: string };

export const templateIds = ["classic", "ocean", "sunset", "forest", "royal", "candy", "gold", "midnight"] as const;
export type TemplateId = (typeof templateIds)[number];

export const templates: Record<TemplateId, { design: Partial<Design>; frame: Pick<Frame, "style" | "color"> }> = {
  classic: { design: {}, frame: { style: "none", color: "#0f172a" } },
  ocean: {
    design: { fg: "#0ea5e9", fg2: "#1e40af", gradient: true, dots: "rounded", cornerSquare: "extra-rounded", cornerDot: "dot", cornerColor: "#1e40af" },
    frame: { style: "classic", color: "#1e40af" },
  },
  sunset: {
    design: { fg: "#f97316", fg2: "#db2777", gradient: true, dots: "dots", cornerSquare: "extra-rounded", cornerDot: "dot", cornerColor: "#db2777" },
    frame: { style: "bubble", color: "#db2777" },
  },
  forest: {
    design: { fg: "#166534", dots: "classy-rounded", cornerSquare: "extra-rounded", cornerDot: "square", cornerColor: "#15803d", bg: "#f0fdf4" },
    frame: { style: "caption", color: "#166534" },
  },
  royal: {
    design: { fg: "#5b21b6", fg2: "#a21caf", gradient: true, dots: "classy-rounded", cornerSquare: "extra-rounded", cornerDot: "dot", cornerColor: "#5b21b6" },
    frame: { style: "top", color: "#6d28d9" },
  },
  candy: {
    design: { fg: "#db2777", dots: "dots", cornerSquare: "dot", cornerDot: "dot", cornerColor: "#be185d", bg: "#fdf2f8" },
    frame: { style: "border", color: "#db2777" },
  },
  gold: {
    design: {
      fg: "#78350f",
      fg2: "#b45309",
      gradient: true,
      dots: "extra-rounded",
      cornerSquare: "extra-rounded",
      cornerDot: "dot",
      cornerColor: "#92400e",
      bg: "#fffbeb",
    },
    frame: { style: "classic", color: "#92400e" },
  },
  midnight: {
    design: { fg: "#0f172a", fg2: "#334155", gradient: true, dots: "rounded", cornerSquare: "extra-rounded", cornerDot: "square", cornerColor: "#2753e6" },
    frame: { style: "bubble", color: "#0f172a" },
  },
};

/** Kích thước nội bộ của mã QR (SVG nên không ảnh hưởng chất lượng khi xuất). */
const Q = 300;

/**
 * qr-code-styling mã hoá mỗi ký tự thành 1 byte (charCode & 0xff), làm hỏng chữ có dấu.
 * Đổi chuỗi thành các byte UTF-8 (mỗi byte là 1 ký tự) để mã QR chứa đúng UTF-8.
 */
function toUtf8Bytes(text: string) {
  if (/^[\x00-\x7f]*$/.test(text)) return text;
  let out = "";
  for (const byte of new TextEncoder().encode(text)) out += String.fromCharCode(byte);
  return out;
}

function qrOptions(data: string, d: Design): Options {
  return {
    width: Q,
    height: Q,
    type: "svg",
    data: toUtf8Bytes(data),
    margin: d.margin,
    image: d.logo ?? undefined,
    qrOptions: { errorCorrectionLevel: d.ec },
    imageOptions: { crossOrigin: "anonymous", margin: 4, imageSize: d.logoSize, hideBackgroundDots: d.hideDots },
    dotsOptions: d.gradient
      ? {
          type: d.dots,
          gradient: { type: "linear", rotation: Math.PI / 4, colorStops: [{ offset: 0, color: d.fg }, { offset: 1, color: d.fg2 }] },
        }
      : { type: d.dots, color: d.fg },
    backgroundOptions: { color: d.transparent ? "rgba(0,0,0,0)" : d.bg },
    cornersSquareOptions: { type: d.cornerSquare, color: d.cornerColor },
    cornersDotOptions: { type: d.cornerDot, color: d.cornerColor },
  };
}

const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Đặt SVG mã QR vào vị trí (x, y) bên trong SVG khung. */
function placeQr(qrSvg: string, x: number, y: number) {
  const el = new DOMParser().parseFromString(qrSvg, "image/svg+xml").documentElement;
  el.setAttribute("x", String(x));
  el.setAttribute("y", String(y));
  el.setAttribute("width", String(Q));
  el.setAttribute("height", String(Q));
  if (!el.getAttribute("viewBox")) el.setAttribute("viewBox", `0 0 ${Q} ${Q}`);
  return new XMLSerializer().serializeToString(el);
}

// Chữ Nhật/Hàn/Trung (toàn khổ) rộng gần gấp đôi chữ Latin
const isWide = (ch: string) => /[ᄀ-ᇿ⺀-鿿가-힯豈-﫿＀-￯]/.test(ch);
const textWidth = (text: string, fontSize: number) => [...text].reduce((w, ch) => w + (isWide(ch) ? 1.02 : 0.62), 0) * fontSize;

function label(text: string, cx: number, cy: number, maxWidth: number, fontSize: number, color: string) {
  // Ước lượng độ rộng chữ; quá dài thì ép vừa khung
  const fit = textWidth(text, fontSize) > maxWidth ? ` textLength="${maxWidth}" lengthAdjust="spacingAndGlyphs"` : "";
  return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-family="Arial, Helvetica, 'Hiragino Sans', 'Yu Gothic', Meiryo, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" font-weight="700" font-size="${fontSize}" letter-spacing="1" fill="${color}"${fit}>${escapeXml(text)}</text>`;
}

function composeFrame(qrSvg: string, frame: Frame, bg: string) {
  const p = 18; // khoảng đệm quanh mã
  const L = 58; // chiều cao vùng chữ
  const r = 18; // bo góc
  const s = 6; // độ dày viền
  const W = Q + 2 * p;
  const fs = 26;
  const textW = W - 2 * p;
  const { style, color, textColor } = frame;
  const text = frame.text.trim();
  let H = W;
  let body = "";

  switch (style) {
    case "classic":
    case "top": {
      H = W + L;
      const qy = style === "top" ? L + p : p;
      const ty = style === "top" ? L / 2 + p / 3 : W + L / 2 - p / 3;
      body =
        `<rect width="${W}" height="${H}" rx="${r}" fill="${color}"/>` +
        `<rect x="${p / 2}" y="${qy - p / 2}" width="${Q + p}" height="${Q + p}" rx="${r * 0.6}" fill="${bg}"/>` +
        placeQr(qrSvg, p, qy) +
        label(text, W / 2, ty, textW, fs, textColor);
      break;
    }
    case "bubble": {
      const ph = L * 0.85;
      const py = W + p * 0.9;
      const t = 14;
      H = py + ph + s;
      body =
        `<rect x="${s / 2}" y="${s / 2}" width="${W - s}" height="${W - s}" rx="${r}" fill="${bg}" stroke="${color}" stroke-width="${s}"/>` +
        placeQr(qrSvg, p, p) +
        `<polygon points="${W / 2 - t},${py + 1} ${W / 2 + t},${py + 1} ${W / 2},${py - t}" fill="${color}"/>` +
        `<rect x="${W * 0.08}" y="${py}" width="${W * 0.84}" height="${ph}" rx="${ph / 2}" fill="${color}"/>` +
        label(text, W / 2, py + ph / 2, W * 0.84 - 2 * p, fs * 0.92, textColor);
      break;
    }
    case "border":
      body = `<rect x="${s / 2}" y="${s / 2}" width="${W - s}" height="${W - s}" rx="${r}" fill="${bg}" stroke="${color}" stroke-width="${s}"/>` + placeQr(qrSvg, p, p);
      break;
    case "caption":
      H = W + L;
      body =
        `<rect x="${s / 2}" y="${s / 2}" width="${W - s}" height="${W - s}" rx="${r}" fill="${bg}" stroke="${color}" stroke-width="${s}"/>` +
        placeQr(qrSvg, p, p) +
        label(text, W / 2, W + L / 2, textW, fs, color);
      break;
    case "none":
      return { svg: qrSvg, width: Q, height: Q };
  }

  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`,
    width: W,
    height: H,
  };
}

export type Rendered = { svg: string; width: number; height: number };

export async function renderQr(data: string, design: Design, frame: Frame): Promise<Rendered> {
  const { default: QRCodeStyling } = await import("qr-code-styling");
  const raw = await new QRCodeStyling(qrOptions(data, design)).getRawData("svg");
  const qrSvg = raw instanceof Blob ? await raw.text() : String(raw ?? "");
  // Nền trong khung: theo màu nền mã, nếu trong suốt thì để trắng cho dễ quét
  const bg = design.transparent ? "#ffffff" : design.bg;
  return composeFrame(qrSvg, frame, bg);
}

export const svgUrl = (svg: string) => URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));

function save(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Tải xuống SVG, hoặc vẽ SVG lên canvas để xuất PNG/JPG/WEBP với chiều rộng `width`. */
export async function downloadRendered({ svg, width, height }: Rendered, format: FileExtension, targetWidth: number, name: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  if (format === "svg") return save(blob, `${name}.svg`);

  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = Math.round((height / width) * targetWidth);
    const ctx = canvas.getContext("2d")!;
    if (format === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const out = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, `image/${format}`, 0.95));
    if (out) save(out, `${name}.${format === "jpeg" ? "jpg" : format}`);
  } finally {
    URL.revokeObjectURL(url);
  }
}
