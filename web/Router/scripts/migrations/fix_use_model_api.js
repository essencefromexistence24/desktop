const fs = require("fs");

let content = fs.readFileSync("src/features/dx/hooks/use-model.ts", "utf8");

// 1. Replace the throw error with API engine setup
content = content.replace(
  'if (modelId.includes("opencode")) {\n        throw new Error("API models use fallback locally");\n      }',
  `if (modelId.includes("opencode")) {
        const engineType = "api" as any;
        cachedEngine = { modelId, instance: null, type: engineType };
        setIsLoading(false);
        setTimeout(() => setProgress(null), 500);
        return null;
      }`,
);

// 2. Add API generation logic in generate()
const apiLogic = `
        if (cachedEngine?.type === "api") {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages, modelId }),
            signal
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
`;

if (!content.includes('fetch("/api/chat"')) {
  content = content.replace(
    "const generator = cachedEngine?.instance ?? (await loadModel(modelId))",
    apiLogic + "\n        const generator = cachedEngine?.instance ?? (await loadModel(modelId))",
  );
}

fs.writeFileSync("src/features/dx/hooks/use-model.ts", content);
console.log("Updated use-model.ts for API generation");
