/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Remove custom CSS handling to use Next.js built-in CSS support
    return config;
  },
  transpilePackages: ['leaflet', 'tw-animate-css', 'lucide-react'],
}

module.exports = nextConfig
