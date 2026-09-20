import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Church campaign funnel lives only at CHURCH_FUNNEL_PATH (/c9471nujd7933ndaouek123).
  // Legacy paths (/church-page-announcements, /church-announcement) are intentionally not redirected.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "t2ms.site",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
