// Path: ./next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Configurações para API routes
  async rewrites() {
    return [];
  },
  // Log adicional em desenvolvimento
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

module.exports = nextConfig