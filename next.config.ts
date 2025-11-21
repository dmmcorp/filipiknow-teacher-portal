import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flippant-goldfinch-440.convex.cloud',
      },
      {
        protocol: 'https',
        hostname: 'tangible-chicken-583.convex.cloud',
      },
    ],
  },
};

export default nextConfig;
