import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained server bundle (.next/standalone) so the Docker
  // image ships only the runtime files it needs (~150 MB instead of ~1 GB).
  // `next start` and `next dev` continue to work unchanged.
  output: "standalone",
};

export default nextConfig;
