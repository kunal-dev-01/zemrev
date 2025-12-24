import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Pages
  output: "export",

  // Required for next/image on static hosting
  images: {
    unoptimized: true,
  },

  // CSS optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Experimental optimizations
  experimental: {
    optimizeCss: true, // Critical CSS inline karega
  },
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
