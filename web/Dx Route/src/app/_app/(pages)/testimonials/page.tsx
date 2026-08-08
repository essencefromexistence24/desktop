import type { Metadata } from "next";
import { PageHeading, PageHeadingTagline, PageHeadingTitle } from "@/components/page-heading";
import { X_HANDLE } from "@/config/site";
import { TESTIMONIALS_1, TESTIMONIALS_2 } from "@/features/portfolio/data/testimonials";
import { JsonLdScript, jsonLdBreadcrumbList } from "@/lib/json-ld";
import { cn } from "@/lib/utils";
import {
  Testimonial,
  TestimonialAuthor,
  TestimonialAuthorName,
  TestimonialAuthorTagline,
  TestimonialAvatar,
  TestimonialAvatarImg,
  TestimonialAvatarRing,
  TestimonialQuote,
} from "@/registry/components/testimonial";
import { Twemoji } from "@/registry/components/twemoji/twemoji";

const title = "Testimonials";
const description = "Trusted by top builders.";

const ogImage = "/og/default.png";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/testimonials",
  },
  openGraph: {
    url: "/testimonials",
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

const TESTIMONIALS = [...TESTIMONIALS_1, ...TESTIMONIALS_2].sort(
  (a, b) => Number(a.order ?? 999) - Number(b.order ?? 999),
);

// Commented out: testimonials page disabled for pure chat app
export default function TestimonialsPage() {
  return null;
}
