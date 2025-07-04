/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  swcMinify: true,
  reactStrictMode: true,
  poweredByHeader: false,
  webpack: (config, { isServer }) => {
    // Ensure proper module resolution for @ aliases
    config.resolve.fallback = {
      ...config.resolve.fallback,
    };
    
    return config;
  },
  experimental: {
    // Ensure proper TypeScript path mapping
    typedRoutes: false,
  },
};

export default nextConfig;
