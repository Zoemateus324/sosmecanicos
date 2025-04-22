/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'github.com', 'vercel.app', 'sosmecanicos-gydkbuy6r-zoemateus324s-projects.vercel.app'],
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone'
};

module.exports = nextConfig;
