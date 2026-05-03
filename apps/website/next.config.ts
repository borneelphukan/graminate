import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com"],
  },
  i18n: {
    locales: ["en", "hi", "as", "de"],
    defaultLocale: "en",
  },
  transpilePackages: ["@graminate/ui"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
