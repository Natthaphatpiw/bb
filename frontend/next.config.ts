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
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Resolve @ alias properly to the root directory
    const rootDir = path.resolve(__dirname);
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': rootDir,
      '@/lib': path.join(rootDir, 'lib'),
      '@/components': path.join(rootDir, 'components'),
      '@/app': path.join(rootDir, 'app'),
    };
    
    // Ensure proper module resolution
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      rootDir,
      path.join(rootDir, 'node_modules'),
    ];
    
    return config;
  },
  
  // Output configuration for production
  output: 'standalone',
};

export default nextConfig;
