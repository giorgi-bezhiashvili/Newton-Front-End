import type { NextConfig } from "next";

// The backend origin (no trailing slash, no /api). Override with
// BACKEND_ORIGIN for local dev, e.g. BACKEND_ORIGIN=http://localhost:3000
const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || "https://newton-theta-bice.vercel.app";

const nextConfig: NextConfig = {
  // Proxies every /api/* call through this app's own origin instead of
  // hitting the backend's domain directly from the browser. This makes
  // the request same-origin from the browser's point of view, so the
  // httpOnly auth cookies the backend sets are first-party cookies —
  // no more relying on SameSite=None, and no more risk of browsers
  // (Safari ITP, Firefox strict tracking protection, etc.) silently
  // dropping the cookie because newton181.vercel.app and
  // newton-theta-bice.vercel.app are different sites under the
  // vercel.app public suffix. It also sidesteps CORS preflights
  // entirely for these calls, since they never leave this origin.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;