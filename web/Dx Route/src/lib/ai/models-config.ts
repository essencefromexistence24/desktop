import { DEFAULT_MODEL_ID, DEFAULT_PROVIDER_ID, GENERATED_PROVIDERS } from "./providers.generated";

export type ExtendedModelOption = {
  id: string;
  name: string;
  provider: string;
  modelName: string;
  contextLength: number;
  maxTokens: number;
  temperature: number;
  topP: number;
  repetitionPenalty: number;
  status: "available" | "downloading" | "unavailable";
  mlcModelId?: string;
  wllamaRepo?: string;
  wllamaFile?: string;
};

export const DEFAULT_MODEL_ID_VALUE = DEFAULT_MODEL_ID;
export const DEFAULT_PROVIDER_ID_VALUE = DEFAULT_PROVIDER_ID;

export const MODEL_OPTIONS: Record<string, ExtendedModelOption> = {
  // Local browser-inference models (WebGPU/Wllama)
  "qwen-0.5b": {
    id: "qwen-0.5b",
    name: "Qwen3 0.6B",
    provider: "huggingface",
    modelName: "onnx-community/Qwen3-0.6B-ONNX",
    contextLength: 2048,
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    repetitionPenalty: 1.05,
    status: "available",
    mlcModelId: "Qwen2-0.5B-Instruct-q4f16_1-MLC",
    wllamaRepo: "Qwen/Qwen2-0.5B-Instruct-GGUF",
    wllamaFile: "qwen2-0_5b-instruct-q4_k_m.gguf",
  },
  "tinyllama-1.1b": {
    id: "tinyllama-1.1b",
    name: "TinyLlama 1.1B",
    provider: "huggingface",
    modelName: "onnx-community/TinyLlama-1.1B-Chat-v1.0",
    contextLength: 2048,
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    repetitionPenalty: 1.1,
    status: "available",
    mlcModelId: "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
    wllamaRepo: "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF",
    wllamaFile: "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
  },
  "minicpm-1b": {
    id: "minicpm-1b",
    name: "MiniCPM 1B",
    provider: "huggingface",
    modelName: "openbmb/MiniCPM-1B",
    contextLength: 4096,
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    repetitionPenalty: 1.1,
    status: "available",
    mlcModelId: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    wllamaRepo: "openbmb/MiniCPM-S-1B-sft-gguf",
    wllamaFile: "MiniCPM-S-1B-sft.gguf",
  },
};

// Populate from generated provider data (for contextLength lookups)
for (const provider of Object.values(GENERATED_PROVIDERS)) {
  for (const model of provider.models) {
    if (!MODEL_OPTIONS[model.id]) {
      MODEL_OPTIONS[model.id] = {
        id: model.id,
        name: model.name,
        provider: provider.id,
        modelName: model.id,
        contextLength: model.contextLength || 8192,
        maxTokens: Math.min(model.contextLength || 8192, 4096),
        temperature: 0.7,
        topP: 0.9,
        repetitionPenalty: 1.0,
        status: "available",
      };
    }
  }
}

export function getModelConfig(id: string): ExtendedModelOption {
  return MODEL_OPTIONS[id] || MODEL_OPTIONS[DEFAULT_MODEL_ID] || Object.values(MODEL_OPTIONS)[0];
}
