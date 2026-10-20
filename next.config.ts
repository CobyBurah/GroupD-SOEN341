import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB. A single upload can carry several resumes (up to
      // MAX_UPLOAD_TOTAL_BYTES = 25MB in total, checked client-side); the extra
      // 1MB covers multipart encoding overhead.
      bodySizeLimit: "26mb",
    },
  },
};

export default nextConfig;
