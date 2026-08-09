const fs = require("fs");

let content = fs.readFileSync("src/lib/ai/models-config.ts", "utf8");

const opencodeModels = `
  "opencode-low": {
    id: "opencode-low",
    name: "MiniMax M3 Free",
    provider: "opencode",
    modelName: "low",
    quantization: "api",
    contextLength: 8192,
    description: "Free Tier",
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    repetitionPenalty: 1.0,
    status: "available",
  },
  "opencode-high": {
    id: "opencode-high",
    name: "BigPickle",
    provider: "opencode",
    modelName: "high",
    quantization: "api",
    contextLength: 8192,
    description: "Free Tier",
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    repetitionPenalty: 1.0,
    status: "available",
  },
  "opencode-xhigh": {
    id: "opencode-xhigh",
    name: "DeepSeek V4 Flash Free",
    provider: "opencode",
    modelName: "xhigh",
    quantization: "api",
    contextLength: 8192,
    description: "Free Tier",
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    repetitionPenalty: 1.0,
    status: "available",
  },
  "opencode-default": {
    id: "opencode-default",
    name: "Mimo V2.5 Free",
    provider: "opencode",
    modelName: "default",
    quantization: "api",
    contextLength: 8192,
    description: "Free Tier",
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    repetitionPenalty: 1.0,
    status: "available",
  },
  "opencode-medium": {
    id: "opencode-medium",
    name: "Nemotron 3 Super Free",
    provider: "opencode",
    modelName: "medium",
    quantization: "api",
    contextLength: 8192,
    description: "Free Tier",
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    repetitionPenalty: 1.0,
    status: "available",
  },
  "opencode-xlow": {
    id: "opencode-xlow",
    name: "Nemotron 3 Ultra Free",
    provider: "opencode",
    modelName: "xlow",
    quantization: "api",
    contextLength: 8192,
    description: "Free Tier",
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    repetitionPenalty: 1.0,
    status: "available",
  },
`;

if (!content.includes("opencode-high")) {
  content = content.replace(
    "export const MODEL_OPTIONS: Record<ModelId, ExtendedModelOption> = {",
    "export const MODEL_OPTIONS: Record<ModelId | string, ExtendedModelOption> = {\n" +
      opencodeModels,
  );

  // also fix type error: Record<ModelId, ...> to Record<string, ...>
  // content = content.replace('Record<ModelId, ExtendedModelOption>', 'Record<string, ExtendedModelOption>');

  fs.writeFileSync("src/lib/ai/models-config.ts", content);
  console.log("Added opencode models to models-config.ts");
} else {
  console.log("Models already added");
}
