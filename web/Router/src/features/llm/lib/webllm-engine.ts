import { CreateMLCEngine } from "@mlc-ai/web-llm";
import type { LLMChatOptions, LLMEngine } from "../types";

export class WebLLMEngine implements LLMEngine {
  readonly type = "webllm" as const;
  private engine: Awaited<ReturnType<typeof CreateMLCEngine>> | null = null;

  async load(modelId: string): Promise<void> {
    this.engine = await CreateMLCEngine(modelId, {
      initProgressCallback: (report) => {
        if (report.text) console.debug("[WebLLM]", report.text);
      },
    });
  }

  async chat(options: LLMChatOptions): Promise<{ message: string } | undefined> {
    if (!this.engine) throw new Error("Model not loaded");

    if (options.stream && options.onData) {
      const asyncChunks = await this.engine.chat.completions.create({
        messages: options.messages,
        stream: true,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 512,
      });

      let content = "";
      for await (const chunk of asyncChunks) {
        const delta = chunk.choices?.[0]?.delta?.content ?? "";
        if (delta) {
          content += delta;
          options.onData(delta);
        }
      }

      return { message: content };
    }

    const reply = await this.engine.chat.completions.create({
      messages: options.messages,
      stream: false,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 512,
    });

    return { message: reply.choices?.[0]?.message?.content ?? "" };
  }

  async exit(): Promise<void> {
    this.engine = null;
  }
}
