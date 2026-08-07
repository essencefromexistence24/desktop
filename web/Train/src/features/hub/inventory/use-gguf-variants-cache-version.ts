// SPDX-License-Identifier: AGPL-3.0-only

import { useSyncExternalStore } from "react";
import {
  getGgufVariantsCacheVersion,
  subscribeGgufVariantsCache,
} from "./gguf-variants-cache-events";

export function useGgufVariantsCacheVersion(
  repoId?: string | null,
): string {
  return useSyncExternalStore(
    subscribeGgufVariantsCache,
    () => getGgufVariantsCacheVersion(repoId),
    () => getGgufVariantsCacheVersion(repoId),
  );
}
