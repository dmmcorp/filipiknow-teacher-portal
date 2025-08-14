import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flippant-goldfinch-440.convex.cloud',
      },
    ]
  }
};

export default nextConfig;
