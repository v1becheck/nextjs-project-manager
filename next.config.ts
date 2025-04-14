import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable TypeScript errors from blocking production builds
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable ESLint errors from blocking production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
