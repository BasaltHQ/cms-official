const withNextIntl = require("next-intl/plugin")("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "voice.ledger1.ai",
      },
      {
        protocol: "https",
        hostname: "image.pollinations.ai",
      },
      {
        protocol: "https",
        hostname: "ledgervoice.blob.core.windows.net",
      },
      {
        protocol: "https",
        hostname: "engram1.blob.core.windows.net",
      },
      // External icon sources
      {
        protocol: "https",
        hostname: "uxwing.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: require("./package.json").version,
  },
  output: "standalone",
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Performance optimizations
  experimental: {
    // Optimize imports for tree-shaking (reduces unused JS)
    optimizePackageImports: ['framer-motion', 'lucide-react', '@measured/puck'],
  },
  // Add preconnect headers for external resources
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Link',
            value: '<https://fonts.googleapis.com>; rel=preconnect, <https://fonts.gstatic.com>; rel=preconnect; crossorigin',
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
