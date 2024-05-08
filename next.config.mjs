/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXt_API_BASE_URL: process.env.NEXt_API_BASE_URL
  }
};

export default nextConfig;
