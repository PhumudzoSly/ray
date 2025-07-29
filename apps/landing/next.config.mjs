import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";


/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  serverExternalPackages: ['@workspace/backend'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add PrismaPlugin to the webpack configuration
      config.plugins.push(new PrismaPlugin());
    }
    return config;
  },
}


export default nextConfig