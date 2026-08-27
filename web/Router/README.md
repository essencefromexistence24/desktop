# Router

Route AI requests across providers with reliable fallbacks and a unified workspace.

## Stack

- **Web**: Next.js 16 (App Router)
- **Desktop/Mobile**: Tauri v2
- **Backend**: Drizzle ORM + Postgres
- **AI**: AI SDK v7
- **Monorepo**: Bun workspaces + Turborepo

## AI Providers

The provider catalog is the single source of truth for every model gateway, frontier lab,
web-session bridge, and local runtime this project can route to. It is merged from this
fork **and** the upstream `G:\Dx\OmniRoute` catalog.

| Metric | Count | Source |
| ------ | -----: | ------ |
| Provider definitions (all categories) | **433** | `src/shared/constants/providers/*.ts` (15 category files) |
| Registry-backed providers (with model catalogs) | 253 | `route/open-sse/config/providers/registry/` |
| Generated UI catalog (`GENERATED_PROVIDERS`) | 433 | `src/lib/ai/providers.generated.ts` (regenerated 2026-08-22) |
| Total listed models across generated catalog | ~1,740 | `providers.generated.ts` |
| Provider icons shipped | 464 | `public/providers/*.{png,svg}` |

### Category breakdown (433 total)

| Category file | Providers |
| ------------- | --------: |
| `apikey/gateways.ts` (aggregators & routers) | 138 |
| `apikey/regional.ts` (CN/KR/JP/EU regional clouds) | 60 |
| `apikey/inference-hosts.ts` (GPU hosts) | 40 |
| `web-cookie.ts` (free web-session bridges) | 35 |
| `apikey/frontier-labs.ts` (OpenAI/Anthropic/Google direct) | 29 |
| `apikey/specialty-media.ts` (image/video/audio gen) | 28 |
| `oauth.ts` (CLI/IDE OAuth bridges) | 27 |
| `apikey/enterprise-cloud.ts` (Azure/Bedrock/Vertex/Watsonx) | 20 |
| `local.ts` (Ollama/LM Studio/vLLM/MLX/etc.) | 14 |
| `search.ts` (search-augmented providers) | 13 |
| `noauth.ts` (anonymous free endpoints) | 12 |
| `audio.ts` (TTS/STT) | 12 |
| `cloud-agent.ts`, `upstream-proxy.ts`, `system.ts` | 6 |

### All providers (433)

Every provider in the catalog, grouped by auth category. IDs are the keys used in
`GENERATED_PROVIDERS`, API routes, and `public/providers/<id>.{png,svg}` icons.

<!-- PROVIDER-LIST:START -->
<details>
<summary><strong>NoAuth</strong> — 12 providers</summary>

| Provider | ID |
| -------- | -- |
| aihorde | `aihorde` |
| auggie | `auggie` |
| chipotle | `chipotle` |
| cloudflare-playground | `cloudflare-playground` |
| devin-cli-agentic | `devin-cli-agentic` |
| duckduckgo-web | `duckduckgo-web` |
| felo-web | `felo-web` |
| mimocode | `mimocode` |
| opencode | `opencode` |
| theoldllm | `theoldllm` |
| veoaifree-web | `veoaifree-web` |
| zcode | `zcode` |

</details>

<details>
<summary><strong>OAuth</strong> — 27 providers</summary>

| Provider | ID |
| -------- | -- |
| agy | `agy` |
| amazon-q | `amazon-q` |
| antigravity | `antigravity` |
| claude | `claude` |
| cline | `cline` |
| clinepass | `clinepass` |
| codebuddy-cn | `codebuddy-cn` |
| codex | `codex` |
| cursor | `cursor` |
| devin-cli | `devin-cli` |
| devin-desktop | `devin-desktop` |
| ghe-copilot | `ghe-copilot` |
| github | `github` |
| gitlab-duo | `gitlab-duo` |
| grok-cli | `grok-cli` |
| kilocode | `kilocode` |
| kimi-coding | `kimi-coding` |
| kiro | `kiro` |
| openference | `openference` |
| qoder | `qoder` |
| qwen | `qwen` |
| raycast | `raycast` |
| trae | `trae` |
| windsurf | `windsurf` |
| xai-oauth | `xai-oauth` |
| zed | `zed` |
| zed-hosted | `zed-hosted` |

</details>

<details>
<summary><strong>WebCookie</strong> — 35 providers</summary>

| Provider | ID |
| -------- | -- |
| adapta-web | `adapta-web` |
| adobe-firefly | `adobe-firefly` |
| blackbox-web | `blackbox-web` |
| chatgpt-web | `chatgpt-web` |
| chatgpt-web-codex | `chatgpt-web-codex` |
| claude-web | `claude-web` |
| conol-web | `conol-web` |
| copilot-m365-web | `copilot-m365-web` |
| copilot-web | `copilot-web` |
| deepseek-web | `deepseek-web` |
| doubao-web | `doubao-web` |
| gemini-business | `gemini-business` |
| gemini-web | `gemini-web` |
| grok-web | `grok-web` |
| hailuo-web | `hailuo-web` |
| huggingchat | `huggingchat` |
| hyperagent | `hyperagent` |
| inner-ai | `inner-ai` |
| kimi-web | `kimi-web` |
| lmarena | `lmarena` |
| microsoft-designer-web | `microsoft-designer-web` |
| muse-spark-web | `muse-spark-web` |
| notion-web | `notion-web` |
| perplexity-web | `perplexity-web` |
| poe-web | `poe-web` |
| promptql | `promptql` |
| qwen-web | `qwen-web` |
| t3-web | `t3-web` |
| tencent-aistudio-web | `tencent-aistudio-web` |
| tinycms-web | `tinycms-web` |
| v0-vercel-web | `v0-vercel-web` |
| venice-web | `venice-web` |
| yuanbao-web | `yuanbao-web` |
| zai-web | `zai-web` |
| zenmux-free | `zenmux-free` |

</details>

<details>
<summary><strong>APIKey</strong> — 314 providers</summary>

| Provider | ID |
| -------- | -- |
| 302ai | `302ai` |
| 360ai | `360ai` |
| abacus | `abacus` |
| abliteration | `abliteration` |
| agentrouter | `agentrouter` |
| agnes | `agnes` |
| ai21 | `ai21` |
| aihubmix | `aihubmix` |
| aimlapi | `aimlapi` |
| ainative | `ainative` |
| aion | `aion` |
| alibaba | `alibaba` |
| alibaba-cn | `alibaba-cn` |
| alibaba-coding-plan | `alibaba-coding-plan` |
| alibaba-coding-plan-cn | `alibaba-coding-plan-cn` |
| alibaba-token-plan | `alibaba-token-plan` |
| alibaba-token-plan-cn | `alibaba-token-plan-cn` |
| amazon-nova | `amazon-nova` |
| ambient | `ambient` |
| ant-ling | `ant-ling` |
| anthropic | `anthropic` |
| anyapi | `anyapi` |
| api-airforce | `api-airforce` |
| api-serpent | `api-serpent` |
| arcee-ai | `arcee-ai` |
| atomic-chat | `atomic-chat` |
| auriko | `auriko` |
| azure-ai | `azure-ai` |
| azure-openai | `azure-openai` |
| bai | `bai` |
| baichuan | `baichuan` |
| baidu | `baidu` |
| bailian-coding-plan | `bailian-coding-plan` |
| bailing | `bailing` |
| baseten | `baseten` |
| bazaarlink | `bazaarlink` |
| bedrock | `bedrock` |
| bedrock-mantle | `bedrock-mantle` |
| berget | `berget` |
| black-forest-labs | `black-forest-labs` |
| blackbox | `blackbox` |
| blueclaw | `blueclaw` |
| bluesminds | `bluesminds` |
| byteplus | `byteplus` |
| bytez | `bytez` |
| cerebras | `cerebras` |
| charm-hyper | `charm-hyper` |
| chat-oripe | `chat-oripe` |
| chatanywhere | `chatanywhere` |
| cheaperinference | `cheaperinference` |
| chenzk | `chenzk` |
| chutes | `chutes` |
| clarifai | `clarifai` |
| claudinio | `claudinio` |
| cloudcode-one | `cloudcode-one` |
| cloudferro-sherlock | `cloudferro-sherlock` |
| cloudflare-ai | `cloudflare-ai` |
| cloudflare-ai-gateway | `cloudflare-ai-gateway` |
| clova-studio | `clova-studio` |
| codestral | `codestral` |
| cohere | `cohere` |
| cohere-chat | `cohere-chat` |
| command-code | `command-code` |
| cortecs | `cortecs` |
| coze | `coze` |
| crof | `crof` |
| crossmodel | `crossmodel` |
| crusoe | `crusoe` |
| cursor-api | `cursor-api` |
| dahl | `dahl` |
| daoxe | `daoxe` |
| darkbloom | `darkbloom` |
| databricks | `databricks` |
| datarobot | `datarobot` |
| deepai | `deepai` |
| deepinfra | `deepinfra` |
| deepseek | `deepseek` |
| dgrid | `dgrid` |
| dify | `dify` |
| digitalocean | `digitalocean` |
| dinference | `dinference` |
| dit | `dit` |
| doubao | `doubao` |
| dxnt | `dxnt` |
| electronhub | `electronhub` |
| empiriolabs | `empiriolabs` |
| empower | `empower` |
| evroc | `evroc` |
| factory | `factory` |
| fal-ai | `fal-ai` |
| fastrouter | `fastrouter` |
| featherless-ai | `featherless-ai` |
| fenayai | `fenayai` |
| firecrawl | `firecrawl` |
| fireworks | `fireworks` |
| free-ai | `free-ai` |
| freeaiapikey | `freeaiapikey` |
| freebuff | `freebuff` |
| freeinference | `freeinference` |
| freemodel-dev | `freemodel-dev` |
| freetheai | `freetheai` |
| friendliai | `friendliai` |
| frogbot | `frogbot` |
| g4f-gemini | `g4f-gemini` |
| g4f-groq | `g4f-groq` |
| g4f-nvidia | `g4f-nvidia` |
| g4f-ollama | `g4f-ollama` |
| g4f-pollinations | `g4f-pollinations` |
| galadriel | `galadriel` |
| gemini | `gemini` |
| getgoapi | `getgoapi` |
| gigachat | `gigachat` |
| github-models | `github-models` |
| gitlab | `gitlab` |
| gitlawb | `gitlawb` |
| gitlawb-gmi | `gitlawb-gmi` |
| glm | `glm` |
| glm-cn | `glm-cn` |
| glmt | `glmt` |
| gmi-cloud | `gmi-cloud` |
| groq | `groq` |
| hackclub | `hackclub` |
| haiper | `haiper` |
| hcnsec | `hcnsec` |
| helicone | `helicone` |
| helixmind | `helixmind` |
| helyxai | `helyxai` |
| heroku | `heroku` |
| hpc-ai | `hpc-ai` |
| huggingface | `huggingface` |
| hyperbolic | `hyperbolic` |
| ideogram | `ideogram` |
| iflowcn | `iflowcn` |
| iflytek | `iflytek` |
| inception | `inception` |
| inceptron | `inceptron` |
| inference-net | `inference-net` |
| inferx | `inferx` |
| internlm | `internlm` |
| io-net | `io-net` |
| jiekou | `jiekou` |
| jina-ai | `jina-ai` |
| jina-reader | `jina-reader` |
| kenari | `kenari` |
| kie | `kie` |
| kilo-gateway | `kilo-gateway` |
| kimi | `kimi` |
| kimi-coding-apikey | `kimi-coding-apikey` |
| kimi-for-coding | `kimi-for-coding` |
| kuae-cloud-coding-plan | `kuae-cloud-coding-plan` |
| lambda-ai | `lambda-ai` |
| laozhang | `laozhang` |
| leonardo | `leonardo` |
| libertai | `libertai` |
| lilac | `lilac` |
| liquid | `liquid` |
| literouter | `literouter` |
| llamagate | `llamagate` |
| llm-kiwi | `llm-kiwi` |
| llm7 | `llm7` |
| llmgateway | `llmgateway` |
| longcat | `longcat` |
| lucidquery | `lucidquery` |
| magnific | `magnific` |
| maritalk | `maritalk` |
| meganova | `meganova` |
| meganova-ai | `meganova-ai` |
| mergegateway | `mergegateway` |
| meta-llama | `meta-llama` |
| minimax | `minimax` |
| minimax-cn | `minimax-cn` |
| minimax-cn-coding-plan | `minimax-cn-coding-plan` |
| minimax-coding-plan | `minimax-coding-plan` |
| mistral | `mistral` |
| mixedbread | `mixedbread` |
| mixlayer | `mixlayer` |
| mnn-ai | `mnn-ai` |
| moark | `moark` |
| modal | `modal` |
| modelscope | `modelscope` |
| monsterapi | `monsterapi` |
| moonshot | `moonshot` |
| morph | `morph` |
| muse-code | `muse-code` |
| naga-ac | `naga-ac` |
| naga-ai | `naga-ai` |
| nanogpt | `nanogpt` |
| nara | `nara` |
| navy | `navy` |
| nearai | `nearai` |
| nebius | `nebius` |
| neon | `neon` |
| neosantara | `neosantara` |
| neuralwatt | `neuralwatt` |
| nlpcloud | `nlpcloud` |
| nomic | `nomic` |
| nous-research | `nous-research` |
| novita | `novita` |
| nscale | `nscale` |
| nube | `nube` |
| nvidia | `nvidia` |
| oci | `oci` |
| ofoxai | `ofoxai` |
| ollama-cloud | `ollama-cloud` |
| openadapter | `openadapter` |
| openai | `openai` |
| opencode-go | `opencode-go` |
| opencode-zen | `opencode-zen` |
| openference-api | `openference-api` |
| openrouter | `openrouter` |
| openvecta | `openvecta` |
| orcarouter | `orcarouter` |
| ovhcloud | `ovhcloud` |
| parallel-ai | `parallel-ai` |
| perplexity | `perplexity` |
| piapi | `piapi` |
| pinstripes | `pinstripes` |
| pioneer | `pioneer` |
| plamo | `plamo` |
| poe | `poe` |
| poixe-ai | `poixe-ai` |
| pollinations | `pollinations` |
| poolside | `poolside` |
| predibase | `predibase` |
| privatemode | `privatemode` |
| publicai | `publicai` |
| puter | `puter` |
| qianfan | `qianfan` |
| qihang-ai | `qihang-ai` |
| qiniu | `qiniu` |
| qiniu-ai | `qiniu-ai` |
| qwen-cloud | `qwen-cloud` |
| qwen-cloud-token-plan | `qwen-cloud-token-plan` |
| recraft | `recraft` |
| regolo | `regolo` |
| reka | `reka` |
| replicate | `replicate` |
| requesty | `requesty` |
| routeway | `routeway` |
| routing-run | `routing-run` |
| runwayml | `runwayml` |
| sakana | `sakana` |
| sambanova | `sambanova` |
| sap | `sap` |
| sarvam | `sarvam` |
| scaleway | `scaleway` |
| sealion | `sealion` |
| segmind | `segmind` |
| sensenova | `sensenova` |
| siliconflow | `siliconflow` |
| snowflake | `snowflake` |
| sparkdesk | `sparkdesk` |
| speka | `speka` |
| stability-ai | `stability-ai` |
| stackit | `stackit` |
| stepfun | `stepfun` |
| stepfun-ai-step-plan | `stepfun-ai-step-plan` |
| stepfun-step-plan | `stepfun-step-plan` |
| subconscious | `subconscious` |
| submodel | `submodel` |
| sumopod | `sumopod` |
| suno | `suno` |
| synthetic | `synthetic` |
| tabitoken | `tabitoken` |
| tencent | `tencent` |
| tencent-coding-plan | `tencent-coding-plan` |
| tencent-token-plan | `tencent-token-plan` |
| tencent-tokenhub | `tencent-tokenhub` |
| tensormesh | `tensormesh` |
| the-grid-ai | `the-grid-ai` |
| thebai | `thebai` |
| tinfoil | `tinfoil` |
| tinyfish | `tinyfish` |
| together | `together` |
| token-kiosk | `token-kiosk` |
| tokenreply | `tokenreply` |
| tokenrouter | `tokenrouter` |
| topaz | `topaz` |
| trustedrouter | `trustedrouter` |
| typhoon | `typhoon` |
| udio | `udio` |
| umans-ai-coding-plan | `umans-ai-coding-plan` |
| uncloseai | `uncloseai` |
| unorouter | `unorouter` |
| upstage | `upstage` |
| v0-vercel | `v0-vercel` |
| venice | `venice` |
| vercel-ai-gateway | `vercel-ai-gateway` |
| vertex | `vertex` |
| vertex-partner | `vertex-partner` |
| vivgrid | `vivgrid` |
| void-ai | `void-ai` |
| volcengine | `volcengine` |
| voyage-ai | `voyage-ai` |
| wafer | `wafer` |
| wandb | `wandb` |
| watsonx | `watsonx` |
| writer | `writer` |
| x5lab | `x5lab` |
| xai | `xai` |
| xiaomi-mimo | `xiaomi-mimo` |
| xiaomi-mimo-token-plan | `xiaomi-mimo-token-plan` |
| xiaomi-token-plan-ams | `xiaomi-token-plan-ams` |
| xiaomi-token-plan-cn | `xiaomi-token-plan-cn` |
| xiaomi-token-plan-sgp | `xiaomi-token-plan-sgp` |
| xpersona | `xpersona` |
| yi | `yi` |
| yolo-auto | `yolo-auto` |
| zai | `zai` |
| zeldoc | `zeldoc` |
| zenmux | `zenmux` |
| zerolimitai | `zerolimitai` |
| zhipuai-coding-plan | `zhipuai-coding-plan` |
| zylo-api | `zylo-api` |

</details>

<details>
<summary><strong>Local</strong> — 14 providers</summary>

| Provider | ID |
| -------- | -- |
| comfyui | `comfyui` |
| docker-model-runner | `docker-model-runner` |
| lemonade | `lemonade` |
| llama-cpp | `llama-cpp` |
| llamafile | `llamafile` |
| lm-studio | `lm-studio` |
| mlx-gemma | `mlx-gemma` |
| mlx-qwen | `mlx-qwen` |
| ollama-local | `ollama-local` |
| oobabooga | `oobabooga` |
| sdwebui | `sdwebui` |
| triton | `triton` |
| vllm | `vllm` |
| xinference | `xinference` |

</details>

<details>
<summary><strong>Search</strong> — 13 providers</summary>

| Provider | ID |
| -------- | -- |
| brave-search | `brave-search` |
| dataforseo-search | `dataforseo-search` |
| exa-search | `exa-search` |
| google-pse-search | `google-pse-search` |
| linkup-search | `linkup-search` |
| ollama-search | `ollama-search` |
| perplexity-search | `perplexity-search` |
| searchapi-search | `searchapi-search` |
| searxng-search | `searxng-search` |
| serper-search | `serper-search` |
| tavily-search | `tavily-search` |
| x-search | `x-search` |
| youcom-search | `youcom-search` |

</details>

<details>
<summary><strong>Audio</strong> — 12 providers</summary>

| Provider | ID |
| -------- | -- |
| assemblyai | `assemblyai` |
| aws-polly | `aws-polly` |
| cartesia | `cartesia` |
| deepgram | `deepgram` |
| elevenlabs | `elevenlabs` |
| fishaudio | `fishaudio` |
| gladia | `gladia` |
| inworld | `inworld` |
| playht | `playht` |
| rev-ai | `rev-ai` |
| soniox | `soniox` |
| speechmatics | `speechmatics` |

</details>

<details>
<summary><strong>Proxy</strong> — 2 providers</summary>

| Provider | ID |
| -------- | -- |
| 9router | `9router` |
| cliproxyapi | `cliproxyapi` |

</details>

<details>
<summary><strong>CloudAgent</strong> — 3 providers</summary>

| Provider | ID |
| -------- | -- |
| codex-cloud | `codex-cloud` |
| devin | `devin` |
| jules | `jules` |

</details>

<details>
<summary><strong>System</strong> — 1 providers</summary>

| Provider | ID |
| -------- | -- |
| auto | `auto` |

</details>
<!-- PROVIDER-LIST:END -->

### Regenerating the catalog

```bash
bun run scripts/generate-providers.ts
```

This rewrites `src/lib/ai/providers.generated.ts`. Do not edit that file by hand.
The script reads definitions from `src/shared/constants/providers/` and model
registries from `route/open-sse/config/providers/registry/`. Definitions and the
generated catalog are in sync at **433 providers** as of 2026-08-22.

### OpenCode Zen free tier (verified 2026-08-22)

OpenCode Zen exposes an anonymous free tier usable with the public API key:

```bash
curl -s https://opencode.ai/zen/v1/models \
  -H "Authorization: Bearer public" \
  -H "HTTP-Referer: https://opencode.ai/" \
  -H "X-Title: opencode"
```

- Catalog returns **64 models** owned by `opencode`.
- Verified working with `Authorization: Bearer public`:

| Model id | Status |
| -------- | ------ |
| `x-preview-f-free` (alpha preview) | 200 OK — chat works, `"cost":"0"` |
| `nemotron-3.5-lightning-free` | 200 OK |
| `deepseek-v4-flash-free` | catalog free tier |
| `mimo-v2.5-free` | catalog free tier |
| `hy3-free` | catalog free tier |
| `laguna-s-2.1-free` | catalog free tier |
| `muse-spark-1.2-contributor-free` | catalog free tier |

Chat completion example (verified):

```bash
curl -s -X POST https://opencode.ai/zen/v1/chat/completions \
  -H "Authorization: Bearer public" \
  -H "Content-Type: application/json" \
  -d '{"model":"x-preview-f-free","messages":[{"role":"user","content":"hello"}],"max_tokens":100}'
```

Rate limits still apply per key/IP (`big-pickle` returned `429 FreeUsageLimitError`
under load); treat "free unlimited" as generous but not guaranteed.

## Getting started

```bash
bun install
bun run dev
```

## Project docs

- [`AGENTS.md`](./AGENTS.md) — mandatory workflow for AI agents (TODO.md / CHANGELOG.md / README.md system)
- [`TODO.md`](./TODO.md) — live task list; agents must keep it current
- [`CHANGELOG.md`](./CHANGELOG.md) — chronological record of every change
