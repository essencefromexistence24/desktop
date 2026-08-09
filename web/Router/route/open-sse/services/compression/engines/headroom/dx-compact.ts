/**
 * dx-compact.ts — DX Compact (@dx-serializer/core) encoder/decoder for the
 * headroom engine.
 *
 * DX Compact is the PRIMARY token-efficient serialization alongside GCF.
 * Standard TOON (@toon-format/toon) is retained as a fallback in toon.ts.
 *
 * All entry points are FAIL-OPEN: any throw yields null/[] so a DX bug can
 * never break headroom compaction. Pure: no Date.now / Math.random.
 */
import { encode as dxEncode, decode as dxDecode } from "@dx-serializer/core";

export const DX_FENCE_OPEN = "```dx-compact";
export const DX_FENCE_CLOSE = "```";

/**
 * Encode an array of objects into DX Compact format.
 * Returns the encoded string on success, null on failure (fail-open).
 */
export function encodeDxBlock(arr: Record<string, unknown>[]): string | null {
  try {
    return dxEncode(arr);
  } catch {
    return null;
  }
}

/**
 * Wrap DX content in a ```dx-compact fence.
 */
export function wrapDx(blockContent: string): string {
  return `${DX_FENCE_OPEN}\n${blockContent}\n${DX_FENCE_CLOSE}`;
}

/**
 * Decode a fenced DX Compact block back into an array of objects.
 * Strips the fence markers, decodes the inner content, and returns the array.
 * Returns [] on failure (fail-open).
 */
export function decodeDx(text: string): Record<string, unknown>[] {
  let inner = text;
  if (inner.startsWith(DX_FENCE_OPEN + "\n")) {
    inner = inner.slice(DX_FENCE_OPEN.length + 1);
    if (inner.endsWith("\n" + DX_FENCE_CLOSE)) {
      inner = inner.slice(0, inner.length - DX_FENCE_CLOSE.length - 1);
    } else if (inner.endsWith(DX_FENCE_CLOSE)) {
      inner = inner.slice(0, inner.length - DX_FENCE_CLOSE.length);
    }
  }
  try {
    const decoded = dxDecode(inner);
    if (Array.isArray(decoded)) return decoded as Record<string, unknown>[];
    return [decoded as Record<string, unknown>];
  } catch {
    return [];
  }
}
