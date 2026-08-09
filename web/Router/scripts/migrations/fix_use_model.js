const fs = require("fs");

let content = fs.readFileSync("src/features/dx/hooks/use-model.ts", "utf8");

// Insert immediate throw for opencode models in loadModel
const target = "if (cachedEngine?.modelId === modelId) return cachedEngine.instance";
const replacement =
  target +
  '\n\n      if (modelId.includes("opencode")) {\n        throw new Error("API models use fallback locally");\n      }';

if (!content.includes("API models use fallback locally")) {
  content = content.replace(target, replacement);
  fs.writeFileSync("src/features/dx/hooks/use-model.ts", content);
  console.log("Updated use-model.ts to fallback for opencode models");
} else {
  console.log("Already updated use-model.ts");
}
