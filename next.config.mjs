const backendOrigin = (process.env.AIRSCOPE_API_BASE_URL || 'https://airscope-backend-s80j.onrender.com').replace(/\/$/, '');

const nextConfig = {
  // Keep verification builds separate from the running development server.
  distDir: process.env.AIRSCOPE_VERIFY_BUILD === 'true' ? '.next-verify' : '.next',
  reactStrictMode: true,
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${backendOrigin}/api/:path*` }];
  },
};

export default nextConfig;
