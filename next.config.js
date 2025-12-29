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
        hostname: "voice.basalthq.com",
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
      {
        protocol: "https",
        hostname: "*.plesk.page",
      },
      {
        protocol: "https",
        hostname: "cdn.simpleicons.org",
      },
      {
        protocol: "https",
        hostname: "ps.w.org",
      }
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85],
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
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@measured/puck',
      '@tremor/react',
      'date-fns',
      'dayjs',
      'react-icons',
      '@radix-ui/react-icons',
      'recharts'
    ],
    // CSS optimization - disabled because it requires the deprecated 'critters' package
    // Next.js doesn't yet support 'beasties' (the maintained fork) as a replacement
    // optimizeCss: true,
    serverActions: {
      bodySizeLimit: '10mb',
    },
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
  // Redirects for renamed routes
  async redirects() {
    return [
      {
        source: '/voicehub',
        destination: '/echo',
        permanent: true,
      },
      {
        source: '/voicehub/:path*',
        destination: '/echo/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
