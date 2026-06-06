/** @type {import('next').NextConfig} */

// Browser calls go to the same origin under /api and are proxied to the NestJS api,
// avoiding CORS. Override the target with API_PROXY_TARGET (defaults to the api's dev port).
const API_TARGET = globalThis.process?.env?.API_PROXY_TARGET ?? 'http://localhost:4001';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_TARGET}/:path*` }];
  },
};

export default nextConfig;
