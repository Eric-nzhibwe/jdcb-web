/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  // Show the real error message on the error page instead of the generic one
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;
