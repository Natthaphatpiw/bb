import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's.yimg.com',
      },
      {
        protocol: 'https',
        hostname: 'media.zenfs.com',
      },
      {
        protocol: 'https',
        hostname: '**.yahoo.com',
      },
    ],
    unoptimized: true, // Skip optimization for external images to avoid timeout
  },
  
  // Output configuration for production
  output: 'standalone',
};

export default nextConfig;
