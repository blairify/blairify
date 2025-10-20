import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
        port: "",
        pathname: "/**",
      },
          {
        protocol: "https",
        hostname: "d2q79iu7y748jz.cloudfront.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
