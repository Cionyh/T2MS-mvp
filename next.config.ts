import type { NextConfig } from "next";
import {
  CHURCH_FUNNEL_PATH,
  CHURCH_FUNNEL_LEGACY_PATHS,
} from "@/lib/church-funnel";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...CHURCH_FUNNEL_LEGACY_PATHS.map((source) => ({
        source,
        destination: CHURCH_FUNNEL_PATH,
        permanent: true as const,
      })),
      ...CHURCH_FUNNEL_LEGACY_PATHS.map((source) => ({
        source: `${source}/:path*`,
        destination: `${CHURCH_FUNNEL_PATH}/:path*`,
        permanent: true as const,
      })),
    ];
  },
};

export default nextConfig;
