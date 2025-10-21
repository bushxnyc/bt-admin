import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://clerk.blktouch.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' *.blktouch.com; worker-src 'self' blob:;",
          },
        ],
      },
    ];
  },
};

module.exports = {
  ...nextConfig,
  allowedDevOrigins: ["*.blktouch.com"],
};
