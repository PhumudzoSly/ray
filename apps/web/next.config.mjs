/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  serverExternalPackages: ['@workspace/backend']
}


export default nextConfig
