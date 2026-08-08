import type { RegistryItem } from "shadcn/schema";

import { getShadcnThemes } from "./shadcn";
import { getTweakcnThemes } from "./tweakcn";

export async function getCachedThemes(): Promise<Map<string, RegistryItem>> {
  const shadcnThemes = getShadcnThemes();
  const tweakcnThemes = await getTweakcnThemes();
  const themes = [...shadcnThemes, ...tweakcnThemes];
  return new Map(themes.map((theme) => [theme.name, theme]));
}
