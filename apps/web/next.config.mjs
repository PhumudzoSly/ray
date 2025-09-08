import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";


/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  typedRoutes: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: [
    '@opentelemetry/instrumentation',
    'import-in-the-middle', 
    '@prisma/client'
  ],
  webpack: (config, { isServer }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    if (isServer) config.plugins = [...config.plugins, new PrismaPlugin()]
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return config
  },
}


export default nextConfig
