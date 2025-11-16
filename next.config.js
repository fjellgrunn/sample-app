/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@fjell/cache', '@fjell/core', '@fjell/lib-sequelize', '@fjell/logging'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
