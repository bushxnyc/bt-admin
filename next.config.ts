import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://clerk.blktouch.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: https://img.clerk.com",
              "font-src 'self'",
              "connect-src 'self' https://*.blktouch.com https://img.clerk.com wss://*.blktouch.com",
              "frame-src https://clerk.blktouch.com https://*.blktouch.com",
              "worker-src 'self' blob:",
              "base-uri 'none'",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = {
  ...nextConfig,
  allowedDevOrigins: ["https://*.blktouch.com"],
};
