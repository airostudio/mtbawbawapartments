import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (property photos hosted there)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Cloudflare Images / R2 (if you migrate to these later)
      {
        protocol: 'https',
        hostname: '*.cloudflare.com',
      },
      // Unsplash (used for placeholder/demo images)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Allow localhost for local dev
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
