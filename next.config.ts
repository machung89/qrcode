import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // Cho phép tải PDF tới 10 MB qua server action
    serverActions: { bodySizeLimit: "11mb" },
  },
};

export default nextConfig;
