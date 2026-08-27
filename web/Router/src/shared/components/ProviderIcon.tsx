"use client";

/**
 * ProviderIcon — Renders a provider logo prioritizing local SVGs for speed.
 *
 * Strategy (#529):
 * 0. If `src` is set (operator-supplied remote icon URL, #2166), render it — this always
 *    wins over the resolution below. On load error, falls back to
 *    `fallbackText`/`fallbackColor` (a colored text badge) if provided, otherwise falls
 *    through to steps 1-6.
 * 1. Theme-aware static SVGs (`THEMED_SVGS`, e.g. arena-light/dark for lmarena)
 * 2. Try /providers/{id}.svg (local SVG assets — fastest, cached separately from JS bundle)
 * 3. Try @lobehub/icons direct React components (no @lobehub/ui peer runtime)
 * 4. Fall back to thesvg.org CDN (external SVG)
 * 5. Fall back to /providers/{id}.png (legacy static assets)
 * 6. Fall back to a generic AI icon
 *
 * Usage:
 *   <ProviderIcon providerId="openai" size={24} />
 *   <ProviderIcon providerId="anthropic" size={28} type="color" />
 *   <ProviderIcon providerId="openai-compatible-abc" src={node.iconUrl} fallbackText="OC" />
 */

import { createElement, memo, useState } from "react";
import Image from "next/image";

import { useTheme } from "@/shared/hooks/useTheme";

import { getLobeProviderIcon } from "./lobeProviderIcons";

interface ProviderIconProps {
  providerId: string;
  size?: number;
  type?: "mono" | "color";
  className?: string;
  style?: React.CSSProperties;
  /**
   * Optional operator-supplied remote icon URL (#2166) — e.g. a custom icon set for an
   * OpenAI-/Anthropic-compatible provider node. When set, this always takes priority
   * over the resolution chain. On load error, falls back to `fallbackText`
   * (if provided) or the normal resolution chain below.
   */
  src?: string;
  alt?: string;
  fallbackText?: string;
  fallbackColor?: string;
}

function GenericProviderIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flex: "none" }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const KNOWN_SVGS = new Set([
  "360ai",
  "alibaba",
  "anthropic",
  "api-airforce",
  "apikey",
  "arcee",
  "arcee-ai",
  "arena-dark",
  "arena-light",
  "assemblyai",
  "auggie",
  "aws",
  "azure",
  "azureai",
  "baichuan",
  "baidu",
  "bailian",
  "baseten",
  "bazaarlink",
  "bluesminds",
  "brave",
  "brave-search",
  "byteplus",
  "bytez",
  "cartesia",
  "cerebras",
  "charm-hyper",
  "cheaperinference",
  "chipotle",
  "chutes",
  "clarifai",
  "claude",
  "claude-web",
  "cli-generic",
  "cline",
  "cloudflare",
  "codex",
  "cohere",
  "comfyui",
  "command-code",
  "continue",
  "copilot",
  "coze",
  "crof",
  "cursor",
  "deepgram",
  "deepinfra",
  "deepseek",
  "dgrid",
  "dify",
  "digitalocean",
  "dit",
  "docker-model-runner",
  "doubao",
  "droid",
  "duckduckgo-web",
  "elevenlabs",
  "exa",
  "factory",
  "fal",
  "fireworks",
  "freeaiapikey",
  "freemodel-dev",
  "friendli",
  "galadriel",
  "gemini",
  "gitlab",
  "gitlab-duo",
  "gitlawb",
  "gitlawb-gmi",
  "google",
  "grok",
  "groq",
  "hackclub",
  "haiper",
  "hcnsec",
  "heroku",
  "huggingchat",
  "huggingface",
  "hyperbolic",
  "ibm",
  "ideogram",
  "iflytek",
  "inclusionai",
  "inference",
  "inworld",
  "kenari",
  "kilo-gateway",
  "kilocode",
  "kimi",
  "kimi-logomark-dark",
  "kimi-logomark-light",
  "kiro",
  "krutrim",
  "lambda",
  "leonardo",
  "liquid",
  "llm7",
  "longcat",
  "meta",
  "metaai",
  "minimax",
  "mistral",
  "modal",
  "modelscope",
  "monsterapi",
  "moonshot",
  "morph",
  "nebius",
  "nlpcloud",
  "nomic",
  "novita",
  "nube",
  "nvidia",
  "oauth",
  "oci",
  "ollama",
  "openadapter",
  "openai",
  "openclaw",
  "opencode",
  "opencode-dark",
  "opencode-light",
  "openference",
  "openrouter",
  "openvecta",
  "orcarouter",
  "ovhcloud",
  "perplexity",
  "phind",
  "picoclaw",
  "pioneer",
  "playht",
  "poe",
  "pollinations",
  "poolside",
  "publicai",
  "puter",
  "qianfan",
  "qiniu",
  "qwen",
  "qwencloud",
  "recraft",
  "replicate",
  "requesty",
  "roocode",
  "runway",
  "sambanova",
  "sap",
  "scaleway",
  "searchapi",
  "searxng-search",
  "sensenova",
  "serper-search",
  "snowflake",
  "soniox",
  "sparkdesk",
  "stepfun",
  "sumopod",
  "suno",
  "synthetic",
  "t3-web",
  "tavily",
  "tencent",
  "theoldllm",
  "tokenrouter",
  "topazlabs",
  "trae",
  "udio",
  "uncloseai",
  "unorouter",
  "upstage",
  "v0",
  "veoaifree-web",
  "vercel",
  "vllm",
  "volcengine",
  "voyage",
  "wafer",
  "wandb",
  "windsurf",
  "x5lab",
  "xai",
  "xinference",
  "yi",
  "youcom-search",
  "yuanbao-web",
  "zed-hosted",
  "zenmux",
  "zenmux-free",
  "zhipu",

]);

const KNOWN_PNGS = new Set([
  "302ai",
  "9router",
  "abacus",
  "adapta-web",
  "adobe-firefly",
  "agentrouter",
  "agnes",
  "agy",
  "ai21",
  "aihorde",
  "aihubmix",
  "aimlapi",
  "ainative",
  "aion",
  "alibaba-cn",
  "alibaba-coding-plan",
  "alibaba-coding-plan-cn",
  "alibaba-token-plan",
  "alibaba-token-plan-cn",
  "amazon-nova",
  "amazon-q",
  "ambient",
  "ant-ling",
  "anthropic-m",
  "antigravity",
  "anyapi",
  "api-serpent",
  "atomic-chat",
  "auriko",
  "aws-polly",
  "azure-ai",
  "azure-openai",
  "bai",
  "bailian-coding-plan",
  "bedrock",
  "bedrock-mantle",
  "berget",
  "black-forest-labs",
  "blackbox",
  "blackbox-web",
  "chat-oripe",
  "chatgpt-web",
  "chatgpt-web-codex",
  "claudinio",
  "clinepass",
  "cliproxyapi",
  "cloudcode-one",
  "cloudferro-sherlock",
  "cloudflare-ai",
  "cloudflare-ai-gateway",
  "cloudflare-playground",
  "clova-studio",
  "codebuddy-cn",
  "codestral",
  "codex-cloud",
  "cohere-chat",
  "conol-web",
  "copilot-m365-web",
  "copilot-web",
  "cortecs",
  "crossmodel",
  "crusoe",
  "cursor-api",
  "dahl",
  "darkbloom",
  "databricks",
  "dataforseo-search",
  "datarobot",
  "deepai",
  "deepseek-web",
  "devin",
  "devin-cli",
  "devin-cli-agentic",
  "devin-desktop",
  "dinference",
  "doubao-web",
  "dxnt",
  "electronhub",
  "empower",
  "evroc",
  "exa-search",
  "fal-ai",
  "fastrouter",
  "featherless-ai",
  "felo-web",
  "firecrawl",
  "fishaudio",
  "free-ai",
  "freeinference",
  "freepik",
  "friendliai",
  "frogbot",
  "g4f-gemini",
  "g4f-groq",
  "g4f-nvidia",
  "g4f-ollama",
  "g4f-pollinations",
  "gemini-business",
  "gemini-web",
  "getgoapi",
  "ghe-copilot",
  "gigachat",
  "github",
  "github-models",
  "gladia",
  "glm",
  "glm-cn",
  "glmt",
  "gmi-cloud",
  "google-pse-search",
  "grok-cli",
  "grok-web",
  "hailuo-web",
  "helicone",
  "helixmind",
  "helyxai",
  "hpc-ai",
  "hyperagent",
  "iflowcn",
  "inception",
  "inference-net",
  "inferx",
  "inner-ai",
  "internlm",
  "io-net",
  "ironclaw",
  "jiekou",
  "jina-ai",
  "jina-reader",
  "jules",
  "kie",
  "kimi-coding",
  "kimi-coding-apikey",
  "kimi-for-coding",
  "kimi-web",
  "lambda-ai",
  "laozhang",
  "lemonade",
  "letta",
  "lilac",
  "linkup-search",
  "literouter",
  "llama-cpp",
  "llamafile",
  "llamagate",
  "llm-kiwi",
  "llmgateway",
  "lm-studio",
  "lmarena",
  "lucidquery",
  "maritalk",
  "meganova",
  "meganova-ai",
  "mergegateway",
  "meta-llama",
  "microsoft-designer-web",
  "mimocode",
  "minimax-cn",
  "minimax-cn-coding-plan",
  "minimax-coding-plan",
  "mixedbread",
  "mnn-ai",
  "moark",
  "muse-code",
  "muse-spark-web",
  "naga-ac",
  "naga-ai",
  "nanobot",
  "nanogpt",
  "nara",
  "navy",
  "nearai",
  "neon",
  "notion-web",
  "nous-research",
  "nscale",
  "oai-cc",
  "oai-r",
  "ofoxai",
  "ollama-cloud",
  "ollama-local",
  "ollama-search",
  "omp",
  "oobabooga",
  "opencode-go",
  "opencode-zen",
  "openference-api",
  "parallel-ai",
  "perplexity-search",
  "perplexity-web",
  "piapi",
  "pinstripes",
  "plamo",
  "poe-web",
  "poixe-ai",
  "predibase",
  "privatemode",
  "promptql",
  "puter",
  "qiniu-ai",
  "qoder",
  "qwen-cloud",
  "qwen-cloud-token-plan",
  "qwen-web",
  "raycast",
  "regolo",
  "reka",
  "rev-ai",
  "routeway",
  "routing-run",
  "runwayml",
  "sakana",
  "sarvam",
  "sdwebui",
  "sealion",
  "searchapi-search",
  "segmind",
  "siliconflow",
  "speechmatics",
  "speka",
  "stability-ai",
  "stackit",
  "stepfun-ai-step-plan",
  "stepfun-step-plan",
  "subconscious",
  "submodel",
  "tavily-search",
  "tencent-aistudio-web",
  "tencent-coding-plan",
  "tencent-token-plan",
  "tencent-tokenhub",
  "tensormesh",
  "the-grid-ai",
  "thebai",
  "tinfoil",
  "tinyfish",
  "together",
  "token-kiosk",
  "tokenreply",
  "topaz",
  "triton",
  "trustedrouter",
  "typhoon",
  "umans-ai-coding-plan",
  "v0-vercel",
  "v0-vercel-web",
  "venice",
  "venice-web",
  "vercel-ai-gateway",
  "vertex",
  "vertex-partner",
  "void-ai",
  "voyage-ai",
  "watsonx",
  "writer",
  "xai-oauth",
  "xiaomi-mimo",
  "xiaomi-mimo-token-plan",
  "xiaomi-token-plan-ams",
  "xiaomi-token-plan-cn",
  "xiaomi-token-plan-sgp",
  "yolo-auto",
  "zai",
  "zai-web",
  "zcode",
  "zed",
  "zeroclaw",
  "zerolimitai",
  "zhipuai-coding-plan",
  "zoocode",
  "zylo-api",

]);

const THEMED_SVGS: Record<string, { light: string; dark: string }> = {
  // Arena (formerly LMArena) — wire id stays `lmarena`; alias `lma` also accepted.
  lmarena: {
    light: "/providers/arena-light.svg",
    dark: "/providers/arena-dark.svg",
  },
  lma: {
    light: "/providers/arena-light.svg",
    dark: "/providers/arena-dark.svg",
  },
};

const ProviderIcon = memo(function ProviderIcon({
  providerId,
  size = 24,
  type = "color",
  className,
  style,
  src,
  alt,
  fallbackText,
  fallbackColor,
}: ProviderIconProps) {
  const { isDark } = useTheme();
  const normalizedId = providerId.toLowerCase();
  const lobeIcon = getLobeProviderIcon(normalizedId, type);
  const themedSvg = THEMED_SVGS[normalizedId];
  const hasSvg = KNOWN_SVGS.has(normalizedId);
  const hasPng = KNOWN_PNGS.has(normalizedId);

  const [failedAssets, setFailedAssets] = useState<Record<string, true>>({});
  const [remoteSrcFailed, setRemoteSrcFailed] = useState(false);
  const themedKey = `${normalizedId}:themed`;
  const svgKey = `${normalizedId}:svg`;
  const pngKey = `${normalizedId}:png`;
  const theSvgKey = `${normalizedId}:thesvg`;

  const trimmedSrc = typeof src === "string" ? src.trim() : "";
  const themedFailed = failedAssets[themedKey];
  const svgFailed = failedAssets[svgKey];
  const theSvgFailed = failedAssets[theSvgKey];
  const pngFailed = failedAssets[pngKey];

  // #2166: a custom remote icon URL always wins over the resolution chain below.
  // It is a plain <img> (not next/image) so operators can point at any host
  // without requiring `images.remotePatterns` allow-listing for arbitrary domains.
  if (trimmedSrc && !remoteSrcFailed) {
    return (
      <span
        className={className}
        style={{ display: "inline-flex", alignItems: "center", ...style }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- operator-supplied remote URL, not a static/known asset */}
        <img
          src={trimmedSrc}
          alt={alt || providerId}
          width={size}
          height={size}
          style={{ objectFit: "contain", flex: "none" }}
          onError={() => setRemoteSrcFailed(true)}
        />
      </span>
    );
  }

  if (trimmedSrc && remoteSrcFailed && fallbackText) {
    return (
      <span
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          fontSize: Math.max(10, Math.round(size * 0.4)),
          fontWeight: 700,
          lineHeight: 1,
          color: fallbackColor || "currentColor",
          ...style,
        }}
      >
        {fallbackText}
      </span>
    );
  }

  // Tier 1: Theme-aware local SVGs (e.g. Arena light/dark)
  if (themedSvg && !themedFailed) {
    const themedSrc = isDark ? themedSvg.dark : themedSvg.light;
    return (
      <span
        className={className}
        style={{ display: "inline-flex", alignItems: "center", ...style }}
      >
        <Image
          src={themedSrc}
          alt={providerId}
          width={size}
          height={size}
          style={{ objectFit: "contain" }}
          onError={() => setFailedAssets((current) => ({ ...current, [themedKey]: true }))}
          unoptimized
        />
      </span>
    );
  }

  // Tier 2: Local SVG — fastest, cached separately from the JS bundle
  if (hasSvg && !svgFailed) {
    return (
      <span
        className={className}
        style={{ display: "inline-flex", alignItems: "center", ...style }}
      >
        <Image
          src={`/providers/${normalizedId}.svg`}
          alt={providerId}
          width={size}
          height={size}
          style={{ objectFit: "contain" }}
          onError={() => setFailedAssets((current) => ({ ...current, [svgKey]: true }))}
          unoptimized
        />
      </span>
    );
  }

  // Tier 3: LobeHub npm icons — only when no local SVG (or SVG failed to load)
  if (lobeIcon) {
    return (
      <span
        className={className}
        style={{ display: "inline-flex", alignItems: "center", ...style }}
      >
        {createElement(lobeIcon, {
          "aria-label": providerId,
          size,
          style: { flex: "none" },
        })}
      </span>
    );
  }

  // Tier 4: thesvg.org CDN — external SVG fallback for unknown providers
  if (!theSvgFailed) {
    return (
      <span
        className={className}
        style={{ display: "inline-flex", alignItems: "center", ...style }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- external SVG from thesvg.org, not a static/known asset */}
        <img
          src={`https://thesvg.org/icons/${normalizedId}/default.svg`}
          alt={providerId}
          width={size}
          height={size}
          style={{ objectFit: "contain", flex: "none" }}
          onError={() => setFailedAssets((current) => ({ ...current, [theSvgKey]: true }))}
        />
      </span>
    );
  }

  // Tier 5: Local PNG — last resort before generic icon
  if (hasPng && !pngFailed) {
    return (
      <span
        className={className}
        style={{ display: "inline-flex", alignItems: "center", ...style }}
      >
        <Image
          src={`/providers/${normalizedId}.png`}
          alt={providerId}
          width={size}
          height={size}
          style={{ objectFit: "contain" }}
          onError={() => setFailedAssets((current) => ({ ...current, [pngKey]: true }))}
          unoptimized
        />
      </span>
    );
  }

  // Tier 6: Generic AI icon
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", ...style }}>
      <GenericProviderIcon size={size} />
    </span>
  );
});

export default ProviderIcon;
export type { ProviderIconProps };
