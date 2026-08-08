import { cache } from "react";
import { BlockViewer } from "@/app/(preview)/components/block-viewer";
import { getCachedThemes } from "@/app/(preview)/lib/get-themes";
import { formatCode } from "@/lib/format-code";
import { highlightCode } from "@/lib/highlight-code";
import { createFileTreeForRegistryItemFiles, getRegistryItem } from "@/lib/registry";
import type { RegistryItemFile } from "@/lib/registry-types";

export async function BlockDisplay({ name }: { name: string }) {
  const item = await getCachedRegistryItem(name);

  if (!item?.files) {
    return null;
  }

  const [tree, highlightedFiles, themes] = await Promise.all([
    getCachedFileTree(item.files),
    getCachedHighlightedFiles(item.files),
    getCachedThemes(),
  ]);

  return (
    <BlockViewer item={item} tree={tree} highlightedFiles={highlightedFiles} themes={themes} />
  );
}

const getCachedRegistryItem = cache(async (name: string) => {
  return await getRegistryItem(name);
});

const getCachedFileTree = cache((files: Array<{ path: string; target?: string }>) => {
  if (!files) {
    return null;
  }
  return createFileTreeForRegistryItemFiles(files);
});

const getCachedHighlightedFiles = cache(async (files: RegistryItemFile[]) => {
  return (await Promise.all(
    files.map(async (file) => {
      const f = file as {
        path: string;
        content?: string;
        target?: string;
        type: string;
        [key: string]: unknown;
      };
      return {
        ...f,
        highlightedContent: await highlightCode(await formatCode(f.content ?? "", "radix-vega")),
      };
    }),
  )) as (RegistryItemFile & { highlightedContent: string })[];
});
