import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/church-announcement",
        destination: "/church-page-announcements",
        permanent: true,
      },
      {
        source: "/church-announcement/:path*",
        destination: "/church-page-announcements/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
