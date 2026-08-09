export const aiProviders = [
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini"] },
  { id: "anthropic", name: "Anthropic", models: ["claude-3.5-sonnet"] },
  { id: "google", name: "Google", models: ["gemini-2.0-pro"] },
] as const;
