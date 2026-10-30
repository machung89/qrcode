import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // Cho phép tải PDF tới 25 MB (gói Doanh nghiệp) qua server action
    serverActions: { bodySizeLimit: "26mb" },
  },
};

export default nextConfig;

// Cho `next dev` dùng được D1/R2 giả lập trên máy (lưu trong .wrangler/)
initOpenNextCloudflareForDev();
