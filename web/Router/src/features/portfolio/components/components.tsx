import { ArrowRightIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
// Imports removed: component-item moved to _app
// import {
//   ComponentItem,
//   ComponentItemDot,
//   ComponentItemIcon,
//   ComponentItemTitle,
// } from "@/app/(app)/(pages)/components/component-item";
import { Button } from "@/components/base/ui/button";
import { ComponentIcon } from "@/features/doc/components/component-icon";
import { getComponentDocs } from "@/features/doc/data/documents";
import { cn } from "@/lib/utils";

import { Panel, PanelHeader, PanelTitle, PanelTitleSup } from "./panel";
import { PanelTitleCopy } from "./panel-title-copy";

const ID = "components";

// Commented out: components section removed with content pages
export function Components() {
  return null;
}
