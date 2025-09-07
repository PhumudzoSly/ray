import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";


/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  typedRoutes: false,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    '@opentelemetry/instrumentation',
    'import-in-the-middle'
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add PrismaPlugin to the webpack configuration
      config.plugins.push(new PrismaPlugin());
    }
    return config;
  },
}


export default nextConfig
