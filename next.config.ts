import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a lockfile exists higher up too).
  turbopack: {
    root: import.meta.dirname,
  },
}

export default nextConfig
