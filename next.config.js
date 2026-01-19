/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore build errors from optional features
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
