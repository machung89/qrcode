import type { PublicAdUnit } from "./types";

/**
 * Lấy các thẻ <meta name="..." content="..."> trong mã đặt ở vị trí "head"
 * (vd: google-adsense-account, xác minh site) để render phía server,
 * vì bot xác minh của mạng quảng cáo không chạy JavaScript.
 */
export function extractHeadMeta(units: PublicAdUnit[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const unit of units) {
    if (unit.placement !== "head") continue;
    for (const tag of unit.code.match(/<meta\b[^>]*>/gi) ?? []) {
      const attrs: Record<string, string> = {};
      for (const m of tag.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
        attrs[m[1].toLowerCase()] = m[3] ?? m[4] ?? "";
      }
      const name = attrs.name || attrs.property;
      if (name && attrs.content !== undefined) out[name] = attrs.content;
    }
  }
  return out;
}
