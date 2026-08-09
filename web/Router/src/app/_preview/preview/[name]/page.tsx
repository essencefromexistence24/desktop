import type { Metadata } from "next";
import { cache } from "react";
import { X_HANDLE } from "@/config/site";
import { getRegistryItem } from "@/lib/registry";

export const revalidate = false;
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const { Index } = await import("@/registry/__index__");

  const params: Array<{ name: string }> = [];

  for (const itemName in Index) {
    const item = Index[itemName];
    if (["registry:block", "registry:example"].includes(item.type)) {
      params.push({
        name: item.name,
      });
    }
  }

  return params;
}

const getCachedRegistryItem = cache(async (name: string) => {
  return await getRegistryItem(name);
});

export async function generateMetadata({
  params,
}: PageProps<"/preview/[name]">): Promise<Metadata> {
  const { name } = await params;

  const item = await getCachedRegistryItem(name);

  if (!item) {
    return {};
  }

  const title = item.name;
  const description = item.description;

  const blockUrl = `/preview/${item.name}`;
  const ogImage = "/og/default.png";

  return {
    title,
    description,
    alternates: {
      canonical: blockUrl,
    },
    openGraph: {
      url: blockUrl,
      type: "website",
      images: {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title,
      },
    },
    twitter: {
      card: "summary_large_image",
      site: X_HANDLE,
      creator: X_HANDLE,
      images: [ogImage],
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

// Commented out: preview page disabled for pure chat app
export default async function PreviewPage(_params: PageProps<"/preview/[name]">) {
  return null;
}
