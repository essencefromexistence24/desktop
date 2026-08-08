import { Grip, LayoutDashboard } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/base/ui/button";
import { PageHeading, PageHeadingTagline, PageHeadingTitle } from "@/components/page-heading";
import { RemountOnThemeChange } from "@/components/remount-on-theme-change";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { X_HANDLE } from "@/config/site";
import { JsonLdScript, jsonLdBreadcrumbList } from "@/lib/json-ld";
import AppleHelloEffectAllDemo from "@/registry/examples/apple-hello-effect-languages-demo";
import BrandAssetsMenuDemo from "@/registry/examples/brand-assets-menu-demo";
import CodeBlockCommandDemo from "@/registry/examples/code-block-command-demo";
import CopyButtonDemo from "@/registry/examples/copy-button-demo";
import DotGridSpotlightDemo from "@/registry/examples/dot-grid-spotlight-demo";
import ElasticSliderDemo from "@/registry/examples/elastic-slider-demo";
import FluidGradientTextDemo from "@/registry/examples/fluid-gradient-text-demo";
import GitHubContributionsDemo from "@/registry/examples/github-contributions-demo";
import GitHubStarsDemo from "@/registry/examples/github-stars-demo";
import GlowCardGridDemo from "@/registry/examples/glow-card-grid-demo";
import HapticDemo from "@/registry/examples/haptic-demo";
import IconSwapDemo from "@/registry/examples/icon-swap-demo";
import MiddleTruncationDemo from "@/registry/examples/middle-truncation-demo";
import ScrollFadeEffectDemo from "@/registry/examples/scroll-fade-effect-demo";
import ShimmeringTextDemo2 from "@/registry/examples/shimmering-text-demo-02";
import SlideToUnlockDemo from "@/registry/examples/slide-to-unlock-demo";
import TestimonialSpotlightDemo from "@/registry/examples/testimonial-spotlight-demo";
import TestimonialsMarqueeDemo from "@/registry/examples/testimonials-marquee-demo";
import TextFlipDemo from "@/registry/examples/text-flip-demo";
import ThemeSwitcherDemo from "@/registry/examples/theme-switcher-demo";
import ThemeToggleEffectDemo from "@/registry/examples/theme-toggle-effect-demo";
import TOCMinimapDemo from "@/registry/examples/toc-minimap-demo";
import TwemojiDemo from "@/registry/examples/twemoji-demo";
import WheelPickerDemo from "@/registry/examples/wheel-picker-demo";
import WorkExperienceDemo from "@/registry/examples/work-experience-demo";

import { GridItem } from "./grid-item";

const title = "Component Showcase";
const description = "Pixel-perfect, uniquely crafted.";

const ogImage = "/og/default.png";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/components/showcase",
  },
  openGraph: {
    url: "/components/showcase",
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

// Commented out: showcase page disabled for pure chat app
export default function ComponentsShowcasePage() {
  return null;
}
