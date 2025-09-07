import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";


/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  typedRoutes: false,
  typescript: {
    ignoreBuildErrors: true,
  },
   functions: {
    "api/**": {
      excludeFiles: "{.next,*.cache,node_modules,public,app}/**"
    }
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
