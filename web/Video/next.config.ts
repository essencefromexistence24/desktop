import type { NextConfig } from "next";

const isTauriStaticExport = process.env.TAURI_STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isTauriStaticExport ? { output: "export" } : {}),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
