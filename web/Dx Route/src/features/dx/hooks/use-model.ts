"use client";

import type { ModelId } from "@/features/dx/types";
import { getModelConfig } from "@/lib/ai/models-config";
import * as React from "react";

let cachedEngine: {
  modelId: ModelId;
  instance: any;
  type: "webgpu" | "wllama" | "api" | "tauri";
} | null = null;

export interface ModelProgress {
  percent: number;
  stage: string;
  file: string | null;
}

const MOCK_RESPONSES = [
  "That's a great question! Based on what I know, here are some key points to consider...",
  "I'd be happy to help you with that. Let me break this down into a few parts.",
  "Interesting topic! Here's my understanding of the matter.",
  "Let me think about this carefully. There are several aspects to consider.",
];

function formatPrompt(messages: { role: string; content: string }[]): string {
  return messages
    .map((m) => {
      if (m.role === "system") return `system: ${m.content}`;
      if (m.role === "assistant") return `assistant: ${m.content}`;
      return `user: ${m.content}`;
    })
    .join("\n");
}

function getMockResponse(_userMessage: string): string {
  const base = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
  const extra = "\n\n(Simulated response because AI model could not be loaded)";
  return base + extra;
}

export function useModelInference() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState<ModelProgress | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isMock, setIsMock] = React.useState(false);
  const mockRef = React.useRef(false);

  const loadModel = React.useCallback(
    async (modelId: ModelId, onProgress?: (p: ModelProgress) => void) => {
      if (cachedEngine && cachedEngine.modelId === modelId) {
        return cachedEngine.instance;
      }

      setIsLoading(true);
      setError(null);
      setIsMock(false);
      mockRef.current = false;

      if (!["minicpm-1b", "tinyllama-1.1b", "qwen-0.5b"].includes(modelId)) {
        const engineType = "api" as const;
        cachedEngine = { modelId, instance: null, type: engineType };
        setIsLoading(false);
        setTimeout(() => setProgress(null), 500);
        return null;
      }

      const config = getModelConfig(modelId);

      function updateProgress(percent: number, stage: string, file: string | null = null) {
        const p: ModelProgress = { percent, stage, file };
        setProgress(p);
        onProgress?.(p);
      }

      try {
        let instance: any = null;
        let engineType: "webgpu" | "wllama" | "tauri" = "wllama";

        // Detect if running inside Tauri (iOS/Android/Desktop)
        const isTauri =
          typeof window !== "undefined" &&
          (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ !==
            undefined;

        if (isTauri) {
          updateProgress(10, "Initializing dx-flow via Tauri...");
          // We don't need to load a full browser instance, just pass a dummy one
          instance = { isTauri: true };
          engineType = "tauri";
        } else if ((navigator as Navigator & { gpu?: unknown }).gpu) {
          // Check for WebGPU support
          try {
            updateProgress(5, "Initializing WebGPU...");
            const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

            const mlcModelId = config.mlcModelId || "Llama-3-8B-Instruct-q4f32_1-MLC";
            instance = await CreateMLCEngine(mlcModelId, {
              initProgressCallback: (p: any) => {
                updateProgress(Math.round(p.progress * 100), p.text);
              },
            });
            engineType = "webgpu";
          } catch (e) {
            console.warn("WebGPU initialization failed, falling back to Wllama (CPU)", e);
          }
        }

        if (!instance) {
          updateProgress(5, "Initializing Wllama (CPU)...");
          const { Wllama } = await import("@wllama/wllama");

          const CONFIG_PATHS = {
            default: "https://unpkg.com/@wllama/wllama/esm/wasm/multi-thread/wllama.wasm",
            "single-thread/wllama.js":
              "https://unpkg.com/@wllama/wllama/esm/wasm/single-thread/wllama.js",
            "single-thread/wllama.wasm":
              "https://unpkg.com/@wllama/wllama/esm/wasm/single-thread/wllama.wasm",
            "multi-thread/wllama.js":
              "https://unpkg.com/@wllama/wllama/esm/wasm/multi-thread/wllama.js",
            "multi-thread/wllama.wasm":
              "https://unpkg.com/@wllama/wllama/esm/wasm/multi-thread/wllama.wasm",
            "multi-thread/wllama.worker.mjs":
              "https://unpkg.com/@wllama/wllama/esm/wasm/multi-thread/wllama.worker.mjs",
          };

          instance = new Wllama(CONFIG_PATHS);

          const repo = config.wllamaRepo || "openbmb/MiniCPM-1B-sft-gguf";
          const file = config.wllamaFile || "minicpm-1b-sft-q4_0.gguf";

          await instance.loadModelFromHF(
            { repo, file },
            {
              n_ctx: config.contextLength,
              n_batch: config.contextLength,
              n_gpu_layers: 99999,
              n_threads: Math.max(1, navigator.hardwareConcurrency - 1),
              flash_attn: true,
              cache_type_k: "q8_0",
              cache_type_v: "q8_0",
              warmup: true,
              progressCallback: ({ loaded, total }: any) => {
                const percent = Math.round((loaded / total) * 100);
                updateProgress(percent, `Downloading model... ${percent}%`);
              },
            },
          );
          engineType = "wllama";
        }

        updateProgress(100, "Ready!");
        cachedEngine = { modelId, instance, type: engineType };

        setIsLoading(false);
        setTimeout(() => setProgress(null), 500);
        return instance;
      } catch (err) {
        const message = (err as Error).message;
        setError(`${message}. Using fallback mode.`);
        setIsMock(true);
        mockRef.current = true;
        setIsLoading(false);
        setProgress(null);
        throw err;
      }
    },
    [],
  );

  const generate = React.useCallback(
    async (
      modelId: ModelId,
      messages: { role: string; content: string }[],
      onToken: (token: string) => void,
      onDone: () => void,
      onError: (err: Error) => void,
      signal?: AbortSignal,
    ) => {
      if (mockRef.current || isMock) {
        try {
          const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
          const fullResponse = getMockResponse(lastUserMsg?.content ?? "");
          const words = fullResponse.split(/(?<=\s)/);
          for (const word of words) {
            if (signal?.aborted) return;
            onToken(word);
            await new Promise((r) => setTimeout(r, 30 + Math.random() * 40));
          }
          onDone();
        } catch (err) {
          onError(err as Error);
        }
        return;
      }

      try {
        if (cachedEngine?.type === "api") {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages, modelId }),
            signal,
          });

          if (!res.ok) throw new Error(await res.text());

          const reader = res.body?.getReader();
          if (!reader) throw new Error("No response body");
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done || signal?.aborted) break;
            const text = decoder.decode(value, { stream: true });
            if (text) onToken(text);
          }
          onDone();
          return;
        }

        const generator = cachedEngine?.instance ?? (await loadModel(modelId));
        if (signal?.aborted) return;

        const config = getModelConfig(modelId);

        if (cachedEngine?.type === "tauri") {
          // Tauri (dx-flow via Rust)
          const { invoke, Channel } = await import("@tauri-apps/api/core");
          const prompt = formatPrompt(messages);

          const onTokenChannel = new Channel<string>();
          onTokenChannel.onmessage = (token: string) => {
            if (!signal?.aborted) {
              onToken(token);
            }
          };

          await invoke("flow_generate", { prompt, onToken: onTokenChannel });
        } else if (cachedEngine?.type === "webgpu") {
          // Web-LLM (MLCEngine)
          const reply = await generator.chat.completions.create({
            messages,
            temperature: config.temperature,
            top_p: config.topP,
            max_tokens: config.maxTokens,
            stream: true,
          });

          for await (const chunk of reply) {
            if (signal?.aborted) {
              break;
            }
            const token = chunk.choices[0]?.delta.content || "";
            if (token) onToken(token);
          }
        } else {
          // Wllama
          const _response = await generator.createChatCompletion({
            messages,
            temperature: config.temperature,
            top_p: config.topP,
            max_tokens: config.maxTokens,
            cache_prompt: true,
            penalty_repeat: config.repetitionPenalty,
            onNewToken: (_seqId: number, word: string) => {
              if (signal?.aborted) {
                throw new Error("AbortError");
              }
              onToken(word);
            },
          });
        }

        if (!signal?.aborted) {
          onDone();
        }
      } catch (err) {
        if ((err as Error).name === "AbortError" || (err as Error).message === "AbortError") return;
        onError(err as Error);
      }
    },
    [loadModel, isMock],
  );

  return {
    isLoading,
    progress,
    error,
    isMock,
    loadModel,
    generate,
  };
}
