import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Các trang công khai được dựng sẵn lúc build và phát thẳng từ static assets (gần như không tốn CPU).
// Không dùng ISR/revalidate: quảng cáo được tải phía trình duyệt qua /api/ads nên không cần tạo lại trang.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
