/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.producthunt.com",
      },
    ],
    domains: [
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "vercel.com",
      "api.dicebear.com",
      "api.producthunt.com",
    ],
  },
  redirects: async () => {
    return [
      {
        source: "/github",
        destination: "https://github.com/yesmore/inke",
        permanent: true,
      },
      {
        source: "/sdk",
        destination: "https://www.npmjs.com/package/inke",
        permanent: true,
      },
    ];
  },
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;
