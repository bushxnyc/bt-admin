import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

module.exports = {
  ...nextConfig,
  allowedDevOrigins: ["https://*.blktouch.com"],
};
