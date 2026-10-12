import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB; the extra room above the 5MB resume limit covers
      // multipart encoding overhead.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
