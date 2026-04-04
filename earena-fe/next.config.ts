import type { NextConfig } from 'next';

const nextConfig: NextConfig = {

  reactStrictMode: false,

  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, 
    pagesBufferLength: 10,       
  },

  devIndicators: {
    buildActivity: false,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    optimizePackageImports: ['@tiptap/react', 'lucide-react', 'date-fns', 'lodash'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      }
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;