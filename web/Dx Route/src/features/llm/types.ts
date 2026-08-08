export type LLMEngineType = "webllm" | "wllama";

export interface LLMEngineCapabilities {
  engine: LLMEngineType;
  webgpu: boolean;
  vramMB: number;
  reason: string;
}

export interface LLMChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMChatOptions {
  messages: LLMChatMessage[];
  stream?: boolean;
  onData?: (chunk: string) => void;
  temperature?: number;
  maxTokens?: number;
  abortSignal?: AbortSignal;
}

export interface LLMChatResponse {
  message: string;
}

export interface LLMEngine {
  readonly type: LLMEngineType;
  load(modelId: string): Promise<void>;
  chat(options: LLMChatOptions): Promise<LLMChatResponse | undefined>;
  exit(): Promise<void>;
}
