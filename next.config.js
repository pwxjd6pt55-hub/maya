
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['mysql2', 'nodemailer'],
  },
}

module.exports = nextConfig
