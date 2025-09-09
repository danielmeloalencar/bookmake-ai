/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This is required to resolve a bug with server actions and timeouts.
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
