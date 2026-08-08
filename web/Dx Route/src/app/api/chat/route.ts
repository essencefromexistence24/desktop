import { getModel } from "@/lib/ai/providers";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool, zodSchema } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      messages: any[];
      modelId?: string;
      apiKey?: string;
      providerKey?: string;
      providerId?: string;
    };
    const { messages, modelId, apiKey, providerKey } = body;

    // BYOK: If a Google API key is provided, use Gemini multimodal
    if (apiKey) {
      const google = createGoogleGenerativeAI({ apiKey });

      const result = await streamText({
        model: google("gemini-2.0-flash-exp"),
        messages,
        tools: {
          generateImage: tool({
            description: "Generate an image based on a description",
            inputSchema: zodSchema(
              z.object({
                prompt: z.string().describe("The prompt to generate the image"),
              }),
            ),
            execute: async ({ prompt }) => {
              return {
                url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`,
              };
            },
          }),
        },
      });

      return result.toTextStreamResponse();
    }

    // BYOK: If an OpenAI-compatible API key is provided
    if (providerKey) {
      const openai = createOpenAI({ apiKey: providerKey });

      const result = await streamText({
        model: openai("gpt-4o"),
        messages,
      });

      return result.toTextStreamResponse();
    }

    // Fall back to existing provider system using env vars
    const providerId = body.providerId || "opencode";
    const model = getModel(providerId, modelId || "opencode-default");

    if (!model) {
      return new Response("Model not found", { status: 400 });
    }

    const cleanedMessages = (messages || []).map((m: any) => ({
      role: m.role,
      content: m.content,
      ...(m.experimental_attachments
        ? { experimental_attachments: m.experimental_attachments }
        : {}),
    }));

    const result = await streamText({
      model: model as any,
      messages: cleanedMessages,
    });

    return result.toTextStreamResponse();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(message, { status: 500 });
  }
}
