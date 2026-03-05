/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Prevent 308 redirect on /api/game/content/ — Next.js default strips trailing slash before rewrite

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const base = apiUrl.replace(/\/api\/?$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${base}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
