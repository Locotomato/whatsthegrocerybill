import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '**.pexels.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.whatsthegrocerybill.com' }],
        destination: 'https://whatsthegrocerybill.com/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
