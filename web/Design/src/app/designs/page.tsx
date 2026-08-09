import type { Metadata } from "next";

import { DesignsDashboard } from "@/features/projects/designs-dashboard";
import { productName } from "@/lib/product";

export const metadata: Metadata = {
  title: `Designs · ${productName}`,
};

export default function DesignsPage() {
  return <DesignsDashboard />;
}
