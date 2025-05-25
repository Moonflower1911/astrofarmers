/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: ""
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev",
        port: ""
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",             // for things like /api/auth/register
        destination: "http://backend:8080/api/:path*",
      },
      {
        source: "/ndvi/:path*",            // for things like /ndvi/from-coords
        destination: "http://backend:8080/ndvi/:path*",
      }
    ];
  },
};

export default nextConfig;
