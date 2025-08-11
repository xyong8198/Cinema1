import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "shorturl.at" },
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "tinyurl.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "cdn-icons-png.flaticon.com" },
      // Add other image domains you're using
    ],
  },

  eslint: {
    // Only run ESLint during development, not during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
  // Optional: Add a loader configuration if needed
  // loader: 'default',
};

export default nextConfig;
