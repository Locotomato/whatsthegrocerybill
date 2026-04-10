import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
