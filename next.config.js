/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH || '',

  reactStrictMode: false,
};

module.exports = nextConfig;
