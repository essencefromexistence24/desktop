import type { Metadata, Route } from "next";
import { cache } from "react";
import type { SoftwareSourceCode, WithContext } from "schema-dts";
import { JSON_LD_ID } from "@/config/json-ld";
import { blockCategories } from "@/config/registry";
import { LICENSE, SOURCE_CODE_GITHUB_URL, X_HANDLE } from "@/config/site";
import { getAllBlockStaticParams } from "@/lib/blocks";
import { getRegistryItem } from "@/lib/registry";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = false;
export const dynamic = "force-static";
export const dynamicParams = false;

const getCachedStaticParams = cache(getAllBlockStaticParams);

export async function generateStaticParams() {
  return await getCachedStaticParams();
}

const getCachedRegistryItem = cache(async (name: string) => {
  return await getRegistryItem(name);
});

export async function generateMetadata({
  params,
}: PageProps<"/blocks/[category]/[name]">): Promise<Metadata> {
  const { category, name } = await params;

  const item = await getCachedRegistryItem(name);

  if (!item) {
    return {};
  }

  const title = item.name;
  const description = item.description;

  const blockUrl = `/blocks/${category}/${item.name}`;
  const ogImage = "/og/default.png";

  return {
    title,
    description,
    alternates: {
      canonical: blockUrl,
    },
    openGraph: {
      url: blockUrl,
      type: "article",
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
  };
}

function getSoftwareSourceCodeJsonLd(
  category: string,
  item: { name: string; description?: string; meta?: { createdAt?: string } },
): WithContext<SoftwareSourceCode> {
  const blockUrl = `/blocks/${category}/${item.name}`;
  const description = item.description ?? "";

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": absoluteUrl(blockUrl),
    name: item.name,
    description,
    image: absoluteUrl("/og/default.png"),
    url: absoluteUrl(blockUrl),
    datePublished: item.meta?.createdAt ? new Date(item.meta.createdAt).toISOString() : undefined,
    codeRepository: SOURCE_CODE_GITHUB_URL,
    programmingLanguage: [{ "@type": "ComputerLanguage", name: "TypeScript" }],
    runtimePlatform: "React 19",
    codeSampleType: "full (compile ready) solution",
    keywords: ["react", "shadcn", "block"],
    license: LICENSE.url,
    author: { "@id": JSON_LD_ID.person },
    isPartOf: {
      "@type": "CollectionPage",
      "@id": absoluteUrl("/blocks"),
      name: "Blocks",
      url: absoluteUrl("/blocks"),
    },
  };
}

// Commented out: block view page disabled for pure chat app
export default async function BlockViewPage(_params: PageProps<"/blocks/[category]/[name]">) {
  return null;
}

function findNeighbour(blocks: string[], slug: string) {
  const len = blocks.length;

  for (let i = 0; i < len; ++i) {
    if (blocks[i] === slug) {
      return {
        previous: i > 0 ? blocks[i - 1] : null,
        next: i < len - 1 ? blocks[i + 1] : null,
      };
    }
  }

  return { previous: null, next: null };
}
