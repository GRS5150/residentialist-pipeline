/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  serverRuntimeConfig: {
    dbPath: process.env.DATABASE_PATH || '/home/ubuntu/.openclaw/workspace/residentialist/residentialist.db'
  }
}

module.exports = nextConfig
