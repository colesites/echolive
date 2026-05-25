/** @type {import('next').NextConfig} */
const nextConfig = {
  // HLS proxying is handled by the route handler at src/app/hls/[...path]/route.ts
  // (rewrites couldn't follow MediaMTX's 302 redirects internally).
};

module.exports = nextConfig;
