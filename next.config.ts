import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  // CORS para AllAccess: Stream C (C15) la termina con un middleware-like custom.
  async headers() {
    return [
      {
        source: "/api/twin/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.ALLACCESS_PROD_URL ?? "http://localhost:5173",
          },
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
