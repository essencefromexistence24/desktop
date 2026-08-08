import { Wllama } from "@wllama/wllama";
import type { LLMChatOptions, LLMEngine } from "../types";

const DEFAULT_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@wllama/wllama@3.5.1/esm/single-thread/wllama.wasm";

export class WllamaEngine implements LLMEngine {
  readonly type = "wllama" as const;
  private wllama: Wllama | null = null;
  private wasmUrl: string;

  constructor(wasmUrl: string = DEFAULT_WASM_URL) {
    this.wasmUrl = wasmUrl;
  }

  async load(_modelId: string): Promise<void> {
    this.wllama = new Wllama({ default: this.wasmUrl }, { suppressNativeLog: true });
    await this.wllama.loadModelFromUrl(_modelId, {
      n_ctx: 2048,
    });
  }

  async chat(options: LLMChatOptions): Promise<{ message: string } | undefined> {
    if (!this.wllama) throw new Error("Model not loaded");

    const params: Record<string, unknown> = {
      messages: options.messages as unknown as WllamaChatMessage[],
      stream: options.stream ?? false,
      temperature: options.temperature ?? 0.7,
      n_predict: options.maxTokens ?? 512,
    };

    if (options.stream && options.onData) {
      params.onData = (chunk: {
        choices: { delta: { content: string } }[];
      }) => {
        const content = chunk.choices?.[0]?.delta?.content ?? "";
        if (content) options.onData!(content);
      };
    }

    const result = await this.wllama.createChatCompletion(
      params as unknown as Parameters<typeof this.wllama.createChatCompletion>[0],
    );

    if (!options.stream) {
      const response = result as unknown as {
        choices: { message: { content: string } }[];
      };
      return { message: response.choices?.[0]?.message?.content ?? "" };
    }
  }

  async exit(): Promise<void> {
    await this.wllama?.exit();
    this.wllama = null;
  }
}

type WllamaChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
