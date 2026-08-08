import type { Metadata } from "next";
import { Suspense } from "react";
import type { Blog, WithContext } from "schema-dts";
import { PageHeading, PageHeadingTagline, PageHeadingTitle } from "@/components/page-heading";
import { JSON_LD_ID } from "@/config/json-ld";
import { X_HANDLE } from "@/config/site";
import { PostList } from "@/features/blog/components/post-list";
import { PostListWithSearch } from "@/features/blog/components/post-list-with-search";
import { PostSearchInput } from "@/features/blog/components/post-search-input";
import { getBlogPosts } from "@/features/doc/data/documents";
import { JsonLdScript, jsonLdBreadcrumbList } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/utils";

const title = "Blog";
const description = "Writing about code, design, and everything in between.";

const ogImage = "/og/default.png";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    url: "/blog",
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

function getBlogJsonLd(
  posts: { slug: string; metadata: { title: string; createdAt: string } }[],
): WithContext<Blog> {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": absoluteUrl("/blog"),
    name: title,
    description,
    url: absoluteUrl("/blog"),
    isPartOf: { "@id": JSON_LD_ID.website },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": absoluteUrl(`/blog/${post.slug}`),
      headline: post.metadata.title,
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: new Date(post.metadata.createdAt).toISOString(),
    })),
  };
}

// Commented out: blog page disabled for pure chat app
export default function Page() {
  return null;
}
