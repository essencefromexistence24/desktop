import type { LLMEngine, LLMEngineType } from "../types";
import { detectCapabilities, getCachedCapabilities, setCachedCapabilities } from "./capabilities";
import { WebLLMEngine } from "./webllm-engine";
import { WllamaEngine } from "./wllama-engine";

export async function createEngine(force?: LLMEngineType): Promise<LLMEngine> {
  const cached = getCachedCapabilities();
  const cap = cached ?? (await detectCapabilities());

  if (!cached) {
    setCachedCapabilities(cap);
  }

  const engineType = force ?? cap.engine;

  console.debug(`[LLM] Using engine: ${engineType} (${cap.reason})`);

  switch (engineType) {
    case "webllm":
      return new WebLLMEngine();
    case "wllama":
      return new WllamaEngine();
  }
}
