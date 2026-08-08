import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://dx.ai", lastModified: new Date() },
    { url: "https://dx.ai/pricing", lastModified: new Date() },
  ];
}
