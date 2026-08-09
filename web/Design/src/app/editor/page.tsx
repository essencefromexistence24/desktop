import type { Metadata } from "next";

import { LocalEditorPage } from "@/features/editor/components/local-editor-page";
import { productName } from "@/lib/product";

export const metadata: Metadata = {
  title: `Editor · ${productName}`,
};

export default function EditorRoute() {
  return <LocalEditorPage />;
}
