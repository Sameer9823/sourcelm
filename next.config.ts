import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Frontend and API now live in the same Next.js app, so the old
    // rewrites() proxy to a separate Express server is gone.
    serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],
};

export default nextConfig;
