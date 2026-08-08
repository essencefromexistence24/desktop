import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { createMDX } from "fumadocs-mdx/next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const withMDX = createMDX();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  // Typecheck runs separately via `bun run typecheck` — running tsc inside the
  // build doubles peak memory and OOMs on low-commit Windows machines.
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "next-mdx-remote",
    "@omniroute/open-sse",
    "@lobehub/icons",
    "fumadocs-ui",
    "fumadocs-core",
  ],
  serverExternalPackages: [
    "@mlc-ai/web-llm",
    "@ngrok/ngrok",
    "better-sqlite3",
    "wreq-js",
    "koffi",
    "sql.js",
    "sqlite-vec",
    "pino",
    "pino-pretty",
    "keytar",
    "ws",
    "zod",
    "bcryptjs",
  ],
  allowedDevOrigins: ["ncdai.localhost", "ncdai.local", "localhost", "127.0.0.1"],
  devIndicators: false,
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
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
    qualities: [75, 100],
    unoptimized: process.env.NODE_ENV === "development",
  },
  // removeConsole deprecated in Next.js 14+ — use terser or babel plugin instead
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    // Cap build worker concurrency — Turbopack's Rust bundler exhausts memory on
    // multi-core Windows dev machines. Limit workers via NEXT_BUILD_CPUS (default 2).
    ...(process.env.NEXT_BUILD_CPUS
      ? { cpus: Number(process.env.NEXT_BUILD_CPUS), workerThreads: false }
      : {}),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: "/api/v1/:path*",
      },
      {
        source: "/v1",
        destination: "/api/v1",
      },
      {
        source: "/chat/completions",
        destination: "/api/v1/chat/completions",
      },
      {
        source: "/models",
        destination: "/api/v1/models",
      },
    ];
  },
};

export default withMDX(withNextIntl(nextConfig));
