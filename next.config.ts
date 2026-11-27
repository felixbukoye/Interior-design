import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  // The preview proxy terminates TLS and forwards a different host, so dev
  // resources must be reachable from it. Narrow this in production.
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai", "127.0.0.1", "localhost"],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2560],
  },
};

export default nextConfig;
