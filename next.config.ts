import type { NextConfig } from "next";

const nextConfig: NextConfig & { serverExternalPackages: string[] } = {
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
        hostname: "media.licdn.com",
      },
      {
        protocol: "https",
        hostname: "d2q79iu7y748jz.cloudfront.net",
        pathname: "/**",
      },
    ],
  },
  serverExternalPackages: [
    "@react-pdf/font",
    "@react-pdf/layout",
    "@react-pdf/pdfkit",
    "@react-pdf/renderer",
    "@react-pdf/reconciler",
    "yoga-layout",
  ],
};

export default nextConfig;
