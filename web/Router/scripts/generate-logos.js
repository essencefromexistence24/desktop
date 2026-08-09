import fs from "fs";
import path from "path";

const SRC = path.join("inspirations", "lobe-icons", "packages", "static-svg", "icons");
const DEST = path.join("src", "features", "dx", "components", "chat", "provider-logos.tsx");

const providerNames = {
  openai: "OpenAILogo",
  anthropic: "AnthropicLogo",
  google: "GoogleLogo",
  meta: "MetaLogo",
  mistral: "MistralLogo",
  cohere: "CohereLogoIcon",
  qwen: "QwenLogo",
  deepseek: "DeepSeekLogo",
  groq: "GroqLogo",
  cerebras: "CerebrasLogo",
  openrouter: "OpenRouterLogo",
};

// Start with standard imports
let outputContent = `// Provider logo components using SVG from lobe-icons
import React from 'react';

`;

for (const [key, compName] of Object.entries(providerNames)) {
  let svgContent = "";
  const colorPath = path.join(SRC, `${key}-color.svg`);
  const monoPath = path.join(SRC, `${key}.svg`);

  if (fs.existsSync(colorPath)) {
    svgContent = fs.readFileSync(colorPath, "utf-8");
  } else if (fs.existsSync(monoPath)) {
    svgContent = fs.readFileSync(monoPath, "utf-8");
  }

  if (svgContent) {
    // Basic reactification
    svgContent = svgContent
      .replace(
        /<svg[^>]*>/,
        '<svg viewBox="0 0 24 24" className={className} fill="currentColor" {...props}>',
      )
      .replace(/xmlns="[^"]*"/, "")
      .replace(/width="[^"]*"/, "")
      .replace(/height="[^"]*"/, "")
      .replace(/style="[^"]*"/, "")
      .replace(/fill-rule/g, "fillRule")
      .replace(/clip-rule/g, "clipRule")
      .replace(/stroke-width/g, "strokeWidth")
      .replace(/stroke-linecap/g, "strokeLinecap")
      .replace(/stroke-linejoin/g, "strokeLinejoin")
      .replace(/stop-color/g, "stopColor")
      .replace(/stop-opacity/g, "stopOpacity")
      .replace(/clip-path/g, "clipPath");

    outputContent += `export function ${compName}({ className, ...props }: React.SVGProps<SVGSVGElement>) {\n  return (\n    ${svgContent}\n  );\n}\n\n`;
  } else {
    console.log(`Could not find SVG for ${key}`);
    // Fallback simple icon
    outputContent += `export function ${compName}({ className, ...props }: React.SVGProps<SVGSVGElement>) {\n  return (<svg viewBox="0 0 24 24" className={className} fill="currentColor" {...props}><circle cx="12" cy="12" r="10"/></svg>);\n}\n\n`;
  }
}

fs.writeFileSync(DEST, outputContent, "utf-8");
console.log("Successfully generated provider-logos.tsx");
