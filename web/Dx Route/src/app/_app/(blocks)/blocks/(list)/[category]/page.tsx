import type { Metadata } from "next";
import type { CollectionPage, WithContext } from "schema-dts";
import { blockCategories } from "@/config/registry";
import { X_HANDLE } from "@/config/site";
import { getAllBlockIds } from "@/lib/blocks";
import { JsonLdScript, jsonLdBreadcrumbList } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = false;
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return blockCategories.map((category) => ({
    category: category.name,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blocks/[category]">): Promise<Metadata> {
  const { category } = await params;

  const item = blockCategories.find((item) => item.name === category);

  if (!item) {
    return {};
  }

  const title = item.name;
  const description = item.description;

  const categoryUrl = `/blocks/${item.name}`;
  const ogImage = "/og/default.png";

  return {
    title,
    description,
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      url: categoryUrl,
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
  };
}

function getCollectionPageJsonLd(
  category: { name: string; title: string; description: string },
  blockIds: string[],
): WithContext<CollectionPage> {
  const categoryUrl = `/blocks/${category.name}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl(categoryUrl),
    name: category.title,
    description: category.description,
    url: absoluteUrl(categoryUrl),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: blockIds.length,
      itemListElement: blockIds.map((blockId, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/blocks/${category.name}/${blockId}`),
      })),
    },
    isPartOf: {
      "@type": "CollectionPage",
      "@id": absoluteUrl("/blocks"),
      name: "Blocks",
      url: absoluteUrl("/blocks"),
    },
  };
}

// Commented out: blocks category page disabled for pure chat app
export default async function BlocksPage(_params: PageProps<"/blocks/[category]">) {
  return null;
}
