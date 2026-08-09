import { getModel } from "@/lib/ai/providers";
import { streamText } from "ai";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { messages, providerId, modelId, temperature } = body as {
      messages?: { role: "user" | "assistant" | "system"; content: string }[];
      providerId?: string;
      modelId?: string;
      temperature?: number;
    };

    if (!messages) {
      return new Response(JSON.stringify({ error: "messages are required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const pid = providerId || "opencode";
    const mid = modelId || "opencode-default";
    const model = getModel(pid, mid);

    if (!model) {
      return new Response(JSON.stringify({ error: `model not found: ${pid}/${mid}` }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const cleanedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const result = await streamText({
      model: model as any,
      messages: cleanedMessages,
      temperature: typeof temperature === "number" ? temperature : 0.7,
    });

    return result.toTextStreamResponse();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(message, { status: 500 });
  }
}
