import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/base/ui/button";
import { PostItem } from "@/features/blog/components/post-item";
import { getBlogPosts } from "@/features/doc/data/documents";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelTitleSup,
} from "@/features/portfolio/components/panel";
import { PanelTitleCopy } from "@/features/portfolio/components/panel-title-copy";
import { cn } from "@/lib/utils";

const ID = "blog";

// Commented out: blog section removed with content pages
export function Blog() {
  return null;
}
