import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@graminate/ui", "@graminate/shared"],
  reactStrictMode: true,
};

export default nextConfig;
