import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mirrors the old vite.config.ts dev proxy: if you set
  // NEXT_PUBLIC_API_BASE_URL=/api locally, requests to /api/* are
  // forwarded to a local backend running on localhost:3000.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/:path*",
      },
    ];
  },
};

export default nextConfig;
