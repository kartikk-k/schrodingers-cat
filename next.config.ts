import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The gateway serves a tiny playground + the /api surface. Server Actions off;
  // everything interesting is under app/api.
  reactStrictMode: true,
  // Allow large chat bodies through to the route handlers.
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
