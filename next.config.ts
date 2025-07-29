/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', 
  experimental: {
    outputStandalone: true,
  },
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true
  },
  webpack: (config: { externals: string[]; }, { isServer }: any) => {
    if (isServer) {
      config.externals.push('_http_common');
    }
    return config;
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `https://t2ms-production.up.railway.app/api/:path*`,
      },
    ]
  },

  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, 
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token: X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      },
    ]
  },
   server: {
    hostname: '0.0.0.0',
    port: process.env.PORT || 8080, 
  },
};

module.exports = nextConfig;