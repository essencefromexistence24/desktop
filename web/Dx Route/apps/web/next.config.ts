import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  transpilePackages: ["@dx/ai-core", "@dx/db", "@dx/validators"],
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.chanhdai.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
      },
    ],
  },
  compiler:
    process.env.NODE_ENV === "production"
      ? {
          removeConsole: {
            exclude: ["error"],
          },
        }
      : undefined,
};

export default config;
