import type { Message } from "@/features/dx/types";
import { getModelConfig } from "@/lib/ai/models-config";

type TokenCallback = (token: string) => void;
type DoneCallback = () => void;
type ErrorCallback = (err: Error) => void;

let generatorInstance: Awaited<
  ReturnType<typeof import("@huggingface/transformers").pipeline>
> | null = null;
let currentModelId: string | null = null;

async function getOrCreateGenerator(modelId: string) {
  if (generatorInstance && currentModelId === modelId) {
    return generatorInstance;
  }

  const { pipeline } = await import("@huggingface/transformers");
  const config = getModelConfig(modelId as import("@/features/dx/types").ModelId);
  const huggingFaceId = config.modelName;

  generatorInstance = await pipeline("text-generation", huggingFaceId, {
    dtype: "q4",
    device: "cpu",
  });
  currentModelId = modelId;
  return generatorInstance;
}

function formatChatPrompt(messages: Message[]): string {
  return `${messages
    .map((m) => {
      if (m.role === "system") return `System: ${m.content}`;
      if (m.role === "user") return `User: ${m.content}`;
      return `Assistant: ${m.content}`;
    })
    .join("\n")}\nAssistant:`;
}

export async function generateChatCompletion(
  messages: Message[],
  modelId: string,
  onToken: TokenCallback,
  onDone: DoneCallback,
  onError: ErrorCallback,
) {
  try {
    const generator = await getOrCreateGenerator(modelId);
    const config = getModelConfig(modelId as import("@/features/dx/types").ModelId);
    const prompt = formatChatPrompt(messages);

    const { TextStreamer } = await import("@huggingface/transformers");

    let _buffer = "";

    const streamer = new TextStreamer((generator as any).tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (text: string) => {
        _buffer += text;
        onToken(text);
      },
    });

    await (generator as any)(prompt, {
      max_new_tokens: config.maxTokens,
      temperature: config.temperature,
      top_p: config.topP,
      repetition_penalty: config.repetitionPenalty,
      do_sample: true,
      streamer,
    });

    onDone();
  } catch (err) {
    onError(err as Error);
  }
}
