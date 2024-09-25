/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/content-management/blogs',
        permanent: true,
        locale: false
      }
    ]
  },
  reactStrictMode: false
}

module.exports = nextConfig
