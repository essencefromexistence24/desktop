/**
 * toon.ts — TOON/DX Compact encoder candidate for the headroom engine.
 *
 * DX Compact (@dx-serializer/core) is the PRIMARY encoder.
 * Standard TOON (@toon-format/toon) is the FALLBACK if DX fails (e.g. on
 * deeply nested or non-uniform data where DX's inline heuristic backs off).
 *
 * Both are considered alongside GCF in the SmartCrusher best-of-N gate
 * (pickSmallestEncoding). All entry points are FAIL-OPEN: any throw yields
 * null/[] so a bug can never break headroom compaction.
 *
 * Pure: no Date.now / Math.random.
 */
import { encode as dxEncode, decode as dxDecode } from "@dx-serializer/core";
import { encode as toonEncode, decode as toonDecode } from "@toon-format/toon";

export const TOON_FENCE_OPEN = "```toon";
export const TOON_FENCE_CLOSE = "```";

/**
 * Try DX Compact first, fall back to standard TOON.
 * Returns the encoded string on success, null if both fail (fail-open).
 */
export function encodeToonBlock(arr: Record<string, unknown>[]): string | null {
  // DX is the primary — try it first
  try {
    return dxEncode(arr);
  } catch {
    // DX failed — try standard TOON as fallback
    try {
      return toonEncode(arr);
    } catch {
      return null;
    }
  }
}

export function wrapToon(blockContent: string): string {
  return `${TOON_FENCE_OPEN}\n${blockContent}\n${TOON_FENCE_CLOSE}`;
}

/**
 * Decode a fenced block back into an array of objects.
 * Tries DX decode first (it's more lenient with its own output),
 * falls back to standard TOON decode.
 * Returns [] on failure (fail-open).
 */
export function decodeToon(text: string): Record<string, unknown>[] {
  let inner = text;
  if (inner.startsWith(TOON_FENCE_OPEN + "\n")) {
    inner = inner.slice(TOON_FENCE_OPEN.length + 1);
    if (inner.endsWith("\n" + TOON_FENCE_CLOSE)) {
      inner = inner.slice(0, inner.length - TOON_FENCE_CLOSE.length - 1);
    } else if (inner.endsWith(TOON_FENCE_CLOSE)) {
      inner = inner.slice(0, inner.length - TOON_FENCE_CLOSE.length);
    }
  }

  // DX decode first (handles its own compact format)
  try {
    const decoded = dxDecode(inner);
    if (Array.isArray(decoded)) return decoded as Record<string, unknown>[];
    return [decoded as Record<string, unknown>];
  } catch {
    // Fall back to standard TOON decode
    try {
      const decoded = toonDecode(inner);
      if (Array.isArray(decoded)) return decoded as Record<string, unknown>[];
      return [decoded as Record<string, unknown>];
    } catch {
      return [];
    }
  }
}
