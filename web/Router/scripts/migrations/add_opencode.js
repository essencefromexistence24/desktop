const fs = require("fs");
let content = fs.readFileSync("src/lib/ai/providers.ts", "utf8");

// 1. Add "opencode" to ProviderId
content = content.replace(
  '  | "ai-gateway"; // AI Gateway for 20+ providers',
  '  | "ai-gateway"\n  | "opencode"; // Opencode',
);

// 2. Add opencode to providers map
const _opencodeEntry = `
  opencode: {
    id: "opencode",
    name: "Opencode",
    icon: CodeIcon, // We'll just use CodeIcon or a generic one, wait, CodeIcon isn't imported? Let's use OpenAILogo.
    models: [
      { id: "opencode-low", name: "MiniMax M3 Free", modelId: "low", description: "MiniMax M3 Free model" },
      { id: "opencode-high", name: "BigPickle", modelId: "high", description: "BigPickle model" },
      { id: "opencode-xhigh", name: "DeepSeek V4 Flash Free", modelId: "xhigh", description: "DeepSeek V4 Flash Free model" },
      { id: "opencode-default", name: "Mimo V2.5 Free", modelId: "default", description: "Mimo V2.5 Free model" },
      { id: "opencode-medium", name: "Nemotron 3 Super Free", modelId: "medium", description: "Nemotron 3 Super Free model" },
      { id: "opencode-xlow", name: "Nemotron 3 Ultra Free", modelId: "xlow", description: "Nemotron 3 Ultra Free model" },
    ],
    defaultModel: "opencode-default",
    description: "Opencode Free Models",
  },
`;

// Wait, we need an icon. Let's look for an icon imported. `CodeIcon`? No.
// Let's use AnthropicLogo or OpenAILogo for now since we don't know what's imported.
// Actually, let's use `GoogleLogo`.
const actualOpencodeEntry = `
  opencode: {
    id: "opencode",
    name: "Opencode",
    icon: OpenAILogo,
    models: [
      { id: "opencode-low", name: "MiniMax M3 Free", modelId: "low", description: "Free Tier" },
      { id: "opencode-high", name: "BigPickle", modelId: "high", description: "Free Tier" },
      { id: "opencode-xhigh", name: "DeepSeek V4 Flash Free", modelId: "xhigh", description: "Free Tier" },
      { id: "opencode-default", name: "Mimo V2.5 Free", modelId: "default", description: "Free Tier" },
      { id: "opencode-medium", name: "Nemotron 3 Super Free", modelId: "medium", description: "Free Tier" },
      { id: "opencode-xlow", name: "Nemotron 3 Ultra Free", modelId: "xlow", description: "Free Tier" },
    ],
    defaultModel: "opencode-default",
    description: "Opencode Free Models",
  },
`;

content = content.replace(
  "export const providers: Record<ProviderId, ProviderConfig> = {",
  "export const providers: Record<ProviderId, ProviderConfig> = {" + actualOpencodeEntry,
);

// 3. Update defaultProvider and defaultModel
content = content.replace(
  /export const defaultProvider: ProviderId = "groq";\nexport const defaultModel = "llama-3\.1-8b-instant";/,
  'export const defaultProvider: ProviderId = "opencode";\nexport const defaultModel = "opencode-default";',
);

// 4. Update getModel
const getModelCase = `    case "opencode": {
      const opencodeProvider = createOpenAI({
        baseURL: "https://opencode.ai/zen/v1",
        apiKey: process.env.OPENCODE_API_KEY || "empty",
      });
      return opencodeProvider(modelConfig.modelId);
    }
`;

content = content.replace('    case "ai-gateway":', `${getModelCase}    case "ai-gateway":`);

fs.writeFileSync("src/lib/ai/providers.ts", content);
console.log("Updated providers.ts");
