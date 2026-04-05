import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "build-output",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
