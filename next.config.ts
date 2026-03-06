import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/Sayo-Web-Platform" : "",
  assetPrefix: isProd ? "/Sayo-Web-Platform/" : "",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
