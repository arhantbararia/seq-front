import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use "standalone" when building Docker images (set via env)
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),

  allowedDevOrigins: ["127.0.0.1", "localhost"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.simpleicons.org" },
    ],
  },
};

export default nextConfig;

