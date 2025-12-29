import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    headers: async () => [
    {
      source: "/(.*)",
      headers: [{ key: "x-clerk-auth-version", value: "2" }],
    },
  ],
};

module.exports = {
  ...nextConfig,
  allowedDevOrigins: ["https://*.blktouch.com"],
};
