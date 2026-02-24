import type { NextConfig } from "next";
const { i18n } = require("./next-i18next.config");

const nextConfig: NextConfig = {
  transpilePackages: ["@graminate/ui", "@graminate/shared"],
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eu.ui-avatars.com",
      },
    ],
  },
  reactStrictMode: true,
  devIndicators: false,
  i18n,
};

export default nextConfig;
