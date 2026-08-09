import { format } from "date-fns";
import type { ImageProps } from "next/image";
import Image from "next/image";
import Link from "next/link";

import type { Doc } from "@/features/doc/types/document";

type HeadingTypes = "h2" | "h3" | "h4";

// Commented out: blog feature removed
export function PostItem(_props: {
  post: Doc;
  headingAs?: HeadingTypes;
  imageLoading?: ImageProps["loading"];
}) {
  return null;
}
