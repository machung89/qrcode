/**
 * Thẻ <meta> xác minh website (vd google-adsense-account, google-site-verification).
 * Trang công khai là trang tĩnh dựng lúc build, nên thẻ meta lấy từ biến môi trường SITE_META_TAGS
 * (đặt ở Build variables của Cloudflare), dạng: "google-adsense-account=ca-pub-123;google-site-verification=abc".
 * Đổi giá trị thì cần deploy lại để có hiệu lực.
 */
export function siteMetaTags(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of (process.env.SITE_META_TAGS ?? "").split(";")) {
    const i = pair.indexOf("=");
    if (i > 0) out[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
  }
  return out;
}
