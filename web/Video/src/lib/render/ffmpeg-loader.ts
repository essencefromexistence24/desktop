"use client";

export type FfmpegLoadPhase =
  | "idle"
  | "prefetching-core"
  | "prefetching-wasm"
  | "ready"
  | "error";

export interface FfmpegLoadProgress {
  phase: FfmpegLoadPhase;
  bytesLoaded: number;
  bytesTotal: number;
}

type Subscriber = (progress: FfmpegLoadProgress) => void;

let coreBlobURL: string | null = null;
let wasmBlobURL: string | null = null;
let loadPromise: Promise<void> | null = null;
let phase: FfmpegLoadPhase = "idle";
const subscribers = new Set<Subscriber>();
const FETCH_TIMEOUT_MS = 90_000;

export function getLoadPhase(): FfmpegLoadPhase {
  return phase;
}

export function subscribe(cb: Subscriber): () => void {
  subscribers.add(cb);
  return () => { subscribers.delete(cb); };
}

function notify(p: FfmpegLoadPhase, loaded = 0, total = 0) {
  phase = p;
  const progress: FfmpegLoadProgress = { phase: p, bytesLoaded: loaded, bytesTotal: total };
  for (const cb of subscribers) {
    try { cb(progress); } catch { /* noop */ }
  }
}

async function fetchAsBlobURL(
  url: string,
  mimeType: string,
  signal: AbortSignal,
  onProgress?: (loaded: number, total: number) => void,
): Promise<string> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  const cl = response.headers.get("Content-Length");
  const total = cl ? parseInt(cl, 10) : 0;

  let blob: Blob;
  if (total > 0 && response.body) {
    const reader = response.body.getReader();
    const chunks: BlobPart[] = [];
    let loaded = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      onProgress?.(loaded, total);
    }
    blob = new Blob(chunks, { type: mimeType });
  } else {
    blob = await response.blob();
  }
  return URL.createObjectURL(blob);
}

function ffmpegBaseCandidates(): string[] {
  const candidates = new Set<string>();
  const origin = window.location.origin;

  candidates.add(`${origin}/ffmpeg`);

  const pageDir = window.location.pathname.split("/").slice(0, -1).join("/");
  if (pageDir) {
    candidates.add(`${origin}${pageDir}/ffmpeg`);
  }

  const { baseURI } = document;
  if (baseURI && baseURI.startsWith("http")) {
    candidates.add(new URL("ffmpeg", baseURI).toString().replace(/\/$/, ""));
  }

  return [...candidates];
}

async function fetchFfmpegAsset(
  filename: string,
  mimeType: string,
  signal: AbortSignal,
  onProgress?: (loaded: number, total: number) => void,
): Promise<string> {
  let lastError: unknown;
  for (const base of ffmpegBaseCandidates()) {
    try {
      return await fetchAsBlobURL(`${base}/${filename}`, mimeType, signal, onProgress);
    } catch (error) {
      lastError = error;
      if (signal.aborted) throw error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`Failed to fetch ${filename}.`);
}

export async function preloadFfmpeg(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      coreBlobURL = await fetchFfmpegAsset(
        "ffmpeg-core.js",
        "text/javascript",
        controller.signal,
        (loaded, total) => notify("prefetching-core", loaded, total),
      );

      wasmBlobURL = await fetchFfmpegAsset(
        "ffmpeg-core.wasm",
        "application/wasm",
        controller.signal,
        (loaded, total) => notify("prefetching-wasm", loaded, total),
      );

      notify("ready");
    } catch (err) {
      if (coreBlobURL) {
        URL.revokeObjectURL(coreBlobURL);
        coreBlobURL = null;
      }
      if (wasmBlobURL) {
        URL.revokeObjectURL(wasmBlobURL);
        wasmBlobURL = null;
      }
      notify("error");
      loadPromise = null;
      throw err;
    } finally {
      window.clearTimeout(timeoutId);
    }
  })();

  return loadPromise;
}

export function getCachedBlobURLs(): { coreURL: string | null; wasmURL: string | null } {
  return { coreURL: coreBlobURL, wasmURL: wasmBlobURL };
}
