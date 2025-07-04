/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for PostgreSQL client-side build issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        util: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['pg', 'bcryptjs']
  }
};

module.exports = nextConfig;