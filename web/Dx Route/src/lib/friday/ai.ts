import type { Message } from "@/features/dx/components/friday/types";

export async function* streamAssistantReply(
  userMessage: string,
  history: Message[],
  opts: { providerId: string; modelId: string },
): AsyncGenerator<string, void, void> {
  const apiMessages: { role: "user" | "assistant" | "system"; content: string }[] = [
    {
      role: "system",
      content:
        "You are Vercel Chat — a helpful, concise AI workspace assistant. " +
        "Format your replies in GitHub-flavored markdown. Use headings, " +
        "bold, lists, and code blocks where helpful.",
    },
    ...history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: userMessage },
  ];

  try {
    const res = await fetch("/api/friday/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        providerId: opts.providerId,
        modelId: opts.modelId,
        messages: apiMessages,
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`API ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      const chunk = acc;
      acc = "";
      if (chunk) {
        const tokens = chunk.match(/\S+\s*|\s+/g) ?? [chunk];
        for (const t of tokens) {
          await new Promise((r) => setTimeout(r, 8));
          yield t;
        }
      }
    }
    if (acc) yield acc;
  } catch {
    const reply = composeReply(userMessage, history);
    const tokens = reply.split(/(\s+)/);
    for (const token of tokens) {
      await new Promise((r) => setTimeout(r, 18 + Math.random() * 30));
      yield token;
    }
  }
}

function composeReply(userMessage: string, _history: Message[]): string {
  const q = userMessage.trim().toLowerCase();
  if (!q) {
    return "Hi! I'm Vercel Chat. Ask me anything — design, code, or just say hi. ✨";
  }
  if (/^(hi|hello|hey|yo|sup|hola)\b/.test(q)) {
    return "Hey there 👋 — great to see you. What would you like to build or explore today?";
  }
  if (q.includes("who are you") || q.includes("what are you")) {
    return (
      "I'm an AI chat assistant running on a Next.js + Tailwind + Motion stack. " +
      "I stream responses token-by-token from a wide range of AI providers. " +
      "Pick any provider and model from the picker above."
    );
  }
  if (q.includes("model") || q.includes("provider")) {
    return (
      "### Models & providers\n\n" +
      "I support **120+ providers** and **1400+ models** across categories:\n\n" +
      "- **NoAuth** — free models, no API key needed\n" +
      "- **OAuth** — sign-in with your account\n" +
      "- **API Key** — bring your own key\n" +
      "- **Local** — run models on your machine\n" +
      "- **Search**, **Audio**, **Proxy**, and more\n\n" +
      "> Open the model picker to browse and select any provider."
    );
  }
  if (
    q.includes("code") ||
    q.includes("function") ||
    q.includes("typescript") ||
    q.includes("python")
  ) {
    return (
      "Here's a tiny TypeScript helper that debounces any async function:\n\n" +
      "```ts\nfunction debounce<T extends (...args: any[]) => unknown>(\n  fn: T,\n  wait = 200,\n) {\n  let t: ReturnType<typeof setTimeout> | null = null;\n  return (...args: Parameters<T>) => {\n    if (t) clearTimeout(t);\n    t = setTimeout(() => fn(...args), wait);\n  };\n}\n```\n\nAnd a Python version:\n\n" +
      "```python\nimport asyncio\nfrom functools import wraps\n\ndef debounce(wait: float):\n    def decorator(fn):\n        timer = [None]\n        @wraps(fn)\n        async def wrapped(*args, **kwargs):\n            if timer[0]:\n                timer[0].cancel()\n            loop = asyncio.get_event_loop()\n            timer[0] = loop.call_later(wait, lambda: asyncio.create_task(fn(*args, **kwargs)))\n        return wrapped\n    return decorator\n```\n\nWant me to wrap either in a React hook?"
    );
  }
  if (q.includes("design") || q.includes("ui") || q.includes("ux")) {
    return (
      "A few principles I always lean on:\n\n" +
      "1. **Hierarchy first** — make the most important thing the loudest.\n" +
      "2. **Whitespace is a feature** — give elements room to breathe.\n" +
      "3. **Motion with purpose** — animate to communicate, not to decorate.\n" +
      "4. **Dark by default** — most devs live there; respect the system theme too.\n" +
      "5. **Type that scales** — use a real font like *Geist* and a tight type scale.\n\n" +
      "Want feedback on a specific screen?"
    );
  }
  if (q.includes("joke")) {
    return "> Why did the developer go broke?\n>\n> Because they used up all their *cache*. 💸";
  }
  return (
    `Great question. Here's how I'd think about **"${userMessage.slice(0, 80)}"**:\n\n` +
    `- Start by clarifying the *outcome* you want.\n` +
    `- Break the problem into the smallest useful steps.\n` +
    `- Build the smallest version that still delivers the outcome.\n` +
    `- Measure, then iterate.\n\n` +
    `Want me to expand on any of these, or generate a quick example?`
  );
}
