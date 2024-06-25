/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/',
        permanent: true,
        locale: false
      }
    ]
  },
  reactStrictMode: false,
}

module.exports = nextConfig;
