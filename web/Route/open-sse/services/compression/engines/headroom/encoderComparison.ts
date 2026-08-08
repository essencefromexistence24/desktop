/**
 * encoderComparison.ts — pure A/B aggregator for the studio.
 * Scans the same arrays SmartCrusher would compact and reports JSON vs GCF vs TOON
 * sizes (bytes + tokens). countTokens is injected by the caller (open-sse must not
 * import the app-side tiktoken counter). Fail-open: if TOON is unavailable on any
 * array, toonAvailable=false and TOON is not eligible as winner.
 */
import { encodeTabularBlock, wrapTabular } from "./tabular.ts";
import { encodeToonBlock, wrapToon } from "./toon.ts";
import { encodeDxBlock, wrapDx } from "./dx-compact.ts";
import { collectCompactableArrays } from "./smartcrusher.ts";

export interface EncoderSize {
  bytes: number;
  tokens: number;
}
export interface EncoderComparison {
  arraysCompared: number;
  json: EncoderSize;
  gcf: EncoderSize;
  toon: EncoderSize;
  toonAvailable: boolean;
  dx: EncoderSize;
  dxAvailable: boolean;
  winner: "gcf" | "toon" | "dx" | "json";
}

type MessageLike = { role?: string; content?: unknown };
const ZERO: EncoderSize = { bytes: 0, tokens: 0 };

function add(a: EncoderSize, text: string, countTokens: (t: string) => number): EncoderSize {
  return { bytes: a.bytes + Buffer.byteLength(text, "utf8"), tokens: a.tokens + countTokens(text) };
}

function pickWinner(
  json: EncoderSize,
  gcf: EncoderSize,
  toon: EncoderSize,
  toonAvailable: boolean,
  dx: EncoderSize,
  dxAvailable: boolean
): "gcf" | "toon" | "dx" | "json" {
  const candidates: Array<["gcf" | "toon" | "dx" | "json", EncoderSize]> = [
    ["gcf", gcf],
    ["json", json],
  ];
  if (toonAvailable) candidates.push(["toon", toon]);
  if (dxAvailable) candidates.push(["dx", dx]);
  candidates.sort((a, b) => a[1].tokens - b[1].tokens || a[1].bytes - b[1].bytes);
  return candidates[0][0];
}

export function summarizeEncoderCandidates(
  messages: MessageLike[],
  minRows: number,
  countTokens: (text: string) => number
): EncoderComparison {
  const arrays = collectCompactableArrays(messages as never, minRows);
  let json = { ...ZERO },
    gcf = { ...ZERO },
    toon = { ...ZERO },
    dx = { ...ZERO };
  let toonAvailable = arrays.length > 0;
  let dxAvailable = arrays.length > 0;
  for (const arr of arrays) {
    json = add(json, JSON.stringify(arr), countTokens);
    gcf = add(gcf, wrapTabular(encodeTabularBlock(arr)), countTokens);
    const toonInner = encodeToonBlock(arr);
    if (toonInner === null) toonAvailable = false;
    else toon = add(toon, wrapToon(toonInner), countTokens);
    const dxInner = encodeDxBlock(arr);
    if (dxInner === null) dxAvailable = false;
    else dx = add(dx, wrapDx(dxInner), countTokens);
  }
  return {
    arraysCompared: arrays.length,
    json,
    gcf,
    toon: toonAvailable ? toon : { ...ZERO },
    toonAvailable,
    dx: dxAvailable ? dx : { ...ZERO },
    dxAvailable,
    winner: pickWinner(json, gcf, toon, toonAvailable, dx, dxAvailable),
  };
}
