import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  },
};

export default nextConfig;
