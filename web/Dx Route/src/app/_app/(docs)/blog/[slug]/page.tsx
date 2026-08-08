import { getTableOfContents } from "fumadocs-core/content/toc";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { BlogPosting as PageSchema, WithContext } from "schema-dts";
import { MDX } from "@/components/mdx";
import { TOCInline } from "@/components/toc-inline";
import { TOCMinimap } from "@/components/toc-minimap";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Prose } from "@/components/ui/typography";
import { JSON_LD_ID } from "@/config/json-ld";
import { X_HANDLE } from "@/config/site";
import { DocKeyboardShortcuts } from "@/features/doc/components/doc-keyboard-shortcuts";
import {
  DocContainer,
  DocContentCol,
  DocGrid,
  DocLeftCol,
  DocRightCol,
} from "@/features/doc/components/doc-layout";
import { LLMCopyButtonWithViewOptions } from "@/features/doc/components/doc-page-actions";
import { DocPageRoot } from "@/features/doc/components/doc-page-root";
import { DocShareMenu } from "@/features/doc/components/doc-share-menu";
import { findNeighbour, getBlogPosts, getDocBySlug } from "@/features/doc/data/documents";
import type { Doc } from "@/features/doc/types/document";
import { JsonLdScript, jsonLdBreadcrumbList } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = false;
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  const docs = getBlogPosts();
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const slug = (await params).slug;
  const doc = getDocBySlug(slug);

  if (!doc) {
    return notFound();
  }

  const { title, description, image, createdAt, updatedAt } = doc.metadata;

  const postUrl = `/blog/${doc.slug}`;
  const ogImage = image || "/og/default.png";

  return {
    title,
    description,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      url: postUrl,
      type: "article",
      publishedTime: new Date(createdAt).toISOString(),
      modifiedTime: new Date(updatedAt).toISOString(),
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

function getPageJsonLd(doc: Doc): WithContext<PageSchema> {
  const postUrl = `/blog/${doc.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": absoluteUrl(postUrl),
    headline: doc.metadata.title,
    description: doc.metadata.description,
    image: doc.metadata.image || absoluteUrl("/og/default.png"),
    url: absoluteUrl(postUrl),
    datePublished: new Date(doc.metadata.createdAt).toISOString(),
    dateModified: new Date(doc.metadata.updatedAt).toISOString(),
    author: { "@id": JSON_LD_ID.person },
    mainEntityOfPage: absoluteUrl(postUrl),
    isPartOf: {
      "@type": "Blog",
      "@id": absoluteUrl("/blog"),
      name: "Blog",
      url: absoluteUrl("/blog"),
    },
  };
}

// Commented out: blog post page disabled for pure chat app
export default async function Page(_props: PageProps<"/blog/[slug]">) {
  return null;
}
