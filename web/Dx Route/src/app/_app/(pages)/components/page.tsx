import { Grip, LayoutDashboard } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import type { CollectionPage, WithContext } from "schema-dts";
import { Button } from "@/components/base/ui/button";
import { TrustedRegistryIcon } from "@/components/icons";
import { PageHeading, PageHeadingTagline, PageHeadingTitle } from "@/components/page-heading";
import { RegistryCommandAnimated } from "@/components/registry-command-animated";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { JSON_LD_ID } from "@/config/json-ld";
import { registryConfig } from "@/config/registry";
import { UTM_PARAMS, X_HANDLE } from "@/config/site";
import { ComponentIcon } from "@/features/doc/components/component-icon";
import { getComponentDocs } from "@/features/doc/data/documents";
import type { Doc } from "@/features/doc/types/document";
import { JsonLdScript, jsonLdBreadcrumbList } from "@/lib/json-ld";
import { absoluteUrl, cn } from "@/lib/utils";
import { addQueryParams } from "@/lib/utils/url";

import {
  ComponentItem,
  ComponentItemDot,
  ComponentItemIcon,
  ComponentItemTitle,
} from "./component-item";

const title = "Components";
const description = "Pixel-perfect, uniquely crafted.";

const ogImage = "/og/default.png";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/components",
  },
  openGraph: {
    url: "/components",
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

function getCollectionPageJsonLd(
  docs: { name: string; slug: string }[],
): WithContext<CollectionPage> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl("/components"),
    name: title,
    description,
    url: absoluteUrl("/components"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: docs.length,
      itemListElement: docs.map((doc, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/components/${doc.slug}`),
      })),
    },
    isPartOf: { "@id": JSON_LD_ID.website },
  };
}

// Commented out: components page disabled for pure chat app
export default function Page() {
  return null;
}

function ComponentList({
  items,
  showNew = true,
}: {
  items: Doc[];
  showNew?: boolean;
}) {
  return (
    <div className="relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 max-sm:hidden sm:grid-cols-2 md:grid-cols-3">
        <div className="border-r border-line" />
        <div className="border-r border-line max-md:hidden" />
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {items.map((c) => (
          <li
            key={c.slug}
            className={cn(
              "max-sm:screen-line-bottom",
              "sm:max-md:nth-[2n+1]:screen-line-bottom",
              "md:nth-[3n+1]:screen-line-bottom",
            )}
          >
            <ComponentItem href={`/components/${c.slug}` as Route}>
              <ComponentItemIcon>
                <ComponentIcon slug={c.slug} />
                {showNew && (c.metadata.new || c.metadata.updated) && (
                  <ComponentItemDot aria-label={c.metadata.new ? "New" : "Updated"} />
                )}
              </ComponentItemIcon>
              <ComponentItemTitle as="h3">{c.metadata.title}</ComponentItemTitle>
            </ComponentItem>
          </li>
        ))}
      </ul>
    </div>
  );
}
