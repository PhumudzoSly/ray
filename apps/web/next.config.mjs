/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  experimental: {
    serverExternalPackages: [
      "@opentelemetry/api",
      "@opentelemetry/instrumentation",
      "require-in-the-middle"
    ]
  }
}

export default nextConfig
