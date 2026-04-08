import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Cloudflare Pages doesn't support Next.js image optimization
  },
  allowedDevOrigins: ['*.trycloudflare.com'],
};

export default nextConfig;
