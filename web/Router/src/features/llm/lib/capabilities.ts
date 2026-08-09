/// <reference types="@webgpu/types" />

import type { LLMEngineCapabilities } from "../types";

type GPUAccess = {
  requestAdapter(): Promise<GPUAdapter | null>;
};

export async function detectCapabilities(): Promise<LLMEngineCapabilities> {
  const gpu = (navigator as unknown as { gpu?: GPUAccess }).gpu;

  if (!gpu) {
    return {
      engine: "wllama",
      webgpu: false,
      vramMB: 0,
      reason: "WebGPU not available",
    };
  }

  try {
    const adapter = await gpu.requestAdapter();
    if (!adapter) {
      return {
        engine: "wllama",
        webgpu: true,
        vramMB: 0,
        reason: "WebGPU supported but no adapter found",
      };
    }

    const vramMB = estimateVRAM(adapter);

    if (vramMB >= 2048) {
      return {
        engine: "webllm",
        webgpu: true,
        vramMB,
        reason: `GPU with ${vramMB}MB VRAM — sufficient for WebLLM`,
      };
    }

    return {
      engine: "wllama",
      webgpu: true,
      vramMB,
      reason: `GPU with ${vramMB}MB VRAM — too small for WebLLM, using wllama`,
    };
  } catch {
    return {
      engine: "wllama",
      webgpu: true,
      vramMB: 0,
      reason: "WebGPU detection failed, falling back to wllama",
    };
  }
}

function estimateVRAM(adapter: GPUAdapter): number {
  const info = adapter.info as unknown as Record<string, unknown>;
  const name = (info.description as string) ?? (info.device as string) ?? "";

  const limits = adapter.limits;
  const maxBuffer = limits.maxBufferSize;

  const igpuPatterns = [
    /intel.*(?:uhd|iris|hd graphics)/i,
    /amd.*radeon.*(?:vega|graphics)/i,
    /amd.*(?:ryzen|accelerated)/i,
    /microsoft.*basic.*render/i,
    /qualcomm.*adreno/i,
    /apple.*(?:m[1-4])/i,
  ];

  const isIntegrated = igpuPatterns.some((p) => p.test(name));

  if (isIntegrated) {
    return 512;
  }

  if (maxBuffer > 1_000_000_000) {
    return Math.min(Math.round(Number(maxBuffer) / 1_000_000), 16384);
  }

  return 512;
}

export function getCachedCapabilities(): LLMEngineCapabilities | null {
  try {
    const raw = localStorage.getItem("llm:capabilities");
    return raw ? (JSON.parse(raw) as LLMEngineCapabilities) : null;
  } catch {
    return null;
  }
}

export function setCachedCapabilities(cap: LLMEngineCapabilities): void {
  try {
    localStorage.setItem("llm:capabilities", JSON.stringify(cap));
  } catch {
    /* noop */
  }
}
