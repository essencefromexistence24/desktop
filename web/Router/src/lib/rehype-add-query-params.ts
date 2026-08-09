import { visit } from "unist-util-visit";
import { addQueryParams } from "@/lib/utils/url";
import type { UnistNode, UnistTree } from "@/types/unist";

export function rehypeAddQueryParams(params: Record<string, string>) {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (node.type !== "element" || node?.tagName !== "a" || !node?.properties?.href) {
        return;
      }

      const href = node.properties?.href as string | undefined;

      if (
        !href ||
        href.startsWith("/") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#")
      ) {
        return;
      }

      node.properties.href = addQueryParams(href, params);
    });
  };
}
