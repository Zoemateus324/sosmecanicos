/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'github.com', 'vercel.app', 'sosmecanicos-gydkbuy6r-zoemateus324s-projects.vercel.app']
  }
};

module.exports = nextConfig;
