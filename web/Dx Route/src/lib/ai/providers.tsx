import { bedrock } from "@ai-sdk/amazon-bedrock";
import { anthropic } from "@ai-sdk/anthropic";
import { createAzure } from "@ai-sdk/azure";
import { cerebras } from "@ai-sdk/cerebras";
import { cohere } from "@ai-sdk/cohere";
import { deepseek } from "@ai-sdk/deepseek";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { mistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { xai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type React from "react";
import { GENERATED_PROVIDERS } from "./providers.generated";
import type { GeneratedModelConfig, GeneratedProviderConfig } from "./providers.generated";

export type ProviderId = string;

export type ModelConfig = GeneratedModelConfig;
export type ProviderConfig = GeneratedProviderConfig;

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const githubModels = createOpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_MODELS_API_KEY,
});

const azure = createAzure({
  apiKey: process.env.AZURE_API_KEY,
  resourceName: process.env.AZURE_RESOURCE_NAME,
});

const fireworks = createOpenAICompatible({
  name: "fireworks",
  baseURL: "https://api.fireworks.ai/inference/v1",
  apiKey: process.env.FIREWORKS_API_KEY,
});

const together = createOpenAICompatible({
  name: "together",
  baseURL: "https://api.together.xyz/v1",
  apiKey: process.env.TOGETHER_API_KEY,
});

const perplexity = createOpenAICompatible({
  name: "perplexity",
  baseURL: "https://api.perplexity.ai",
  apiKey: process.env.PERPLEXITY_API_KEY,
});

const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

const qwen = createOpenAICompatible({
  name: "qwen",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.QWEN_API_KEY,
});

const huggingface = createOpenAICompatible({
  name: "huggingface",
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HUGGINGFACE_API_KEY,
});

const nvidia = createOpenAICompatible({
  name: "nvidia",
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

const stability = createOpenAICompatible({
  name: "stability",
  baseURL: "https://api.stability.ai/v1",
  apiKey: process.env.STABILITY_API_KEY,
});

function oaiCompatible(
  name: string,
  baseURL: string,
  envVar?: string,
  extraHeaders?: Record<string, string>,
) {
  return createOpenAICompatible({
    name,
    baseURL,
    apiKey: envVar ? process.env[envVar] : "dummy",
    headers: extraHeaders,
  });
}

export const providers: Record<string, GeneratedProviderConfig> = GENERATED_PROVIDERS;

const OAI: Partial<
  Record<string, { baseURL: string; envVar?: string; headers?: Record<string, string> }>
> = {
  meta: { baseURL: "https://api.llama-api.com/v1", envVar: "META_API_KEY" },
  llama: { baseURL: "https://api.llama-api.com/v1", envVar: "LLAMA_API_KEY" },
  moonshot: { baseURL: "https://api.moonshot.cn/v1", envVar: "MOONSHOT_API_KEY" },
  kimi: { baseURL: "https://api.moonshot.cn/v1", envVar: "KIMI_API_KEY" },
  minimax: { baseURL: "https://api.minimax.chat/v1", envVar: "MINIMAX_API_KEY" },
  zhipu: { baseURL: "https://open.bigmodel.cn/api/paas/v4", envVar: "ZHIPU_API_KEY" },
  baichuan: { baseURL: "https://api.baichuan-ai.com/v1", envVar: "BAICHUAN_API_KEY" },
  stepfun: { baseURL: "https://api.stepfun.com/v1", envVar: "STEPFUN_API_KEY" },
  yi: { baseURL: "https://api.01.ai/v1", envVar: "YI_API_KEY" },
  upstage: { baseURL: "https://api.upstage.ai/v1/solar", envVar: "UPSTAGE_API_KEY" },
  ai21: { baseURL: "https://api.ai21.com/studio/v1", envVar: "AI21_API_KEY" },
  databricks: {
    baseURL: "https://your-workspace.cloud.databricks.com/serving-endpoints",
    envVar: "DATABRICKS_TOKEN",
  },
  nebius: { baseURL: "https://api.nebius.ai/v1", envVar: "NEBIUS_API_KEY" },
  deepinfra: { baseURL: "https://api.deepinfra.com/v1/openai", envVar: "DEEPINFRA_API_KEY" },
  siliconflow: { baseURL: "https://api.siliconflow.cn/v1", envVar: "SILICONFLOW_API_KEY" },
  scaleway: { baseURL: "https://inference-api.scaleway.ai/v1", envVar: "SCALEWAY_API_KEY" },
  ovh: { baseURL: "https://llm.endpoints.ai.cloud.ovh.net/api/openai", envVar: "OVH_TOKEN" },
  lepton: { baseURL: "https://api.lepton.ai/v1", envVar: "LEPTON_API_KEY" },
  lambda: { baseURL: "https://api.lambda.ai/v1", envVar: "LAMBDA_API_KEY" },
  venice: { baseURL: "https://api.venice.ai/api/v1", envVar: "VENICE_API_KEY" },
  cartesia: { baseURL: "https://api.cartesia.ai/v1", envVar: "CARTESIA_API_KEY" },
  exa: { baseURL: "https://api.exa.ai/v1", envVar: "EXA_API_KEY" },
  jina: { baseURL: "https://api.jina.ai/v1", envVar: "JINA_API_KEY" },
  tavily: { baseURL: "https://api.tavily.com/v1", envVar: "TAVILY_API_KEY" },
  novita: { baseURL: "https://api.novita.ai/v3/openai", envVar: "NOVITA_API_KEY" },
  featherless: { baseURL: "https://api.featherless.ai/v1", envVar: "FEATHERLESS_API_KEY" },
  glhf: { baseURL: "https://api.glhf.chat/v1", envVar: "GLHF_API_KEY" },
  fal: { baseURL: "https://api.fal.ai/v1", envVar: "FAL_API_KEY" },
  modal: { baseURL: "https://api.modal.com/v1", envVar: "MODAL_API_KEY" },
  kluster: { baseURL: "https://api.kluster.ai/v1", envVar: "KLUSTER_API_KEY" },
  monsterapi: { baseURL: "https://api.monsterapi.ai/v1", envVar: "MONSTERAPI_KEY" },
  premai: { baseURL: "https://api.premai.io/v1", envVar: "PREMAI_API_KEY" },
  unify: { baseURL: "https://api.unify.ai/v1", envVar: "UNIFY_API_KEY" },
  trubit: { baseURL: "https://api.trubit.ai/v1", envVar: "TRUBIT_API_KEY" },
  aionlabs: { baseURL: "https://api.aionlabs.ai/v1", envVar: "AIONLABS_API_KEY" },
  zeno: { baseURL: "https://api.zeno.ai/v1", envVar: "ZENO_API_KEY" },
  xenova: { baseURL: "https://api.xenova.ai/v1", envVar: "XENOVA_API_KEY" },
};

const oaiClients: Partial<Record<string, ReturnType<typeof oaiCompatible>>> = {};

function getOaiClient(id: string) {
  if (!oaiClients[id]) {
    const cfg = OAI[id];
    if (!cfg) return null;
    oaiClients[id] = oaiCompatible(id, cfg.baseURL, cfg.envVar, cfg.headers);
  }
  return oaiClients[id]!;
}

export function getModel(providerId: string, modelId: string) {
  const provider = providers[providerId];
  if (!provider) return null;

  const modelConfig = provider.models.find((mm) => mm.id === modelId);
  if (!modelConfig) return null;

  switch (providerId) {
    case "opencode": {
      const opencodeProvider = createOpenAICompatible({
        name: "opencode",
        baseURL: "https://opencode.ai/zen/v1",
        apiKey: process.env.OPENCODE_API_KEY || "public",
        headers: {
          "HTTP-Referer": "https://opencode.ai/",
          "X-Title": "opencode",
        },
      });
      return opencodeProvider(modelConfig.id);
    }
    case "openai":
      return openai(modelConfig.id);
    case "anthropic":
    case "claude":
      return anthropic(modelConfig.id);
    case "gemini":
    case "google":
    case "vertex":
      return google(modelConfig.id);
    case "xai":
    case "grok":
      return xai(modelConfig.id);
    case "github_models":
      return githubModels(modelConfig.id);
    case "groq":
      return groq(modelConfig.id);
    case "cerebras":
      return cerebras(modelConfig.id);
    case "mistral":
      return mistral(modelConfig.id);
    case "openrouter":
      return openrouter(modelConfig.id);
    case "cohere":
      return cohere(modelConfig.id);
    case "deepseek":
      return deepseek(modelConfig.id);
    case "azure":
      return azure(modelConfig.id);
    case "bedrock":
      return bedrock(modelConfig.id);
    case "fireworks":
      return fireworks(modelConfig.id);
    case "together":
      return together(modelConfig.id);
    case "perplexity":
      return perplexity(modelConfig.id);
    case "ollama":
      return ollama(modelConfig.id);
    case "qwen":
      return qwen(modelConfig.id);
    case "huggingface":
      return huggingface(modelConfig.id);
    case "nvidia":
      return nvidia(modelConfig.id);
    case "stability":
      return stability(modelConfig.id);
    default: {
      const client = getOaiClient(providerId);
      return client ? client(modelConfig.id) : null;
    }
  }
}

export const providerList = Object.values(providers);
export const defaultProvider = "opencode";
export const defaultModel = "opencode-default";
